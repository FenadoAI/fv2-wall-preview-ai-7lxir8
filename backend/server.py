from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import requests
import base64

# AI agents
from ai_agents.agents import AgentConfig, SearchAgent, ChatAgent


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# AI agents init
agent_config = AgentConfig()
search_agent: Optional[SearchAgent] = None
chat_agent: Optional[ChatAgent] = None

# Main app
app = FastAPI(title="AI Agents API", description="Minimal AI Agents API with LangGraph and MCP support")

# API router
api_router = APIRouter(prefix="/api")


# Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str


# AI agent models
class ChatRequest(BaseModel):
    message: str
    agent_type: str = "chat"  # "chat" or "search"
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    success: bool
    response: str
    agent_type: str
    capabilities: List[str]
    metadata: dict = Field(default_factory=dict)
    error: Optional[str] = None


class SearchRequest(BaseModel):
    query: str
    max_results: int = 5


class SearchResponse(BaseModel):
    success: bool
    query: str
    summary: str
    search_results: Optional[dict] = None
    sources_count: int
    error: Optional[str] = None


class WallpaperRequest(BaseModel):
    prompt: str
    aspect_ratio: str = "9:16"  # Default to phone aspect ratio
    style: Optional[str] = None


class WallpaperResponse(BaseModel):
    success: bool
    image_url: Optional[str] = None
    prompt: str
    aspect_ratio: str
    error: Optional[str] = None

# Routes
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# AI agent routes
@api_router.post("/chat", response_model=ChatResponse)
async def chat_with_agent(request: ChatRequest):
    # Chat with AI agent
    global search_agent, chat_agent
    
    try:
        # Init agents if needed
        if request.agent_type == "search" and search_agent is None:
            search_agent = SearchAgent(agent_config)
            
        elif request.agent_type == "chat" and chat_agent is None:
            chat_agent = ChatAgent(agent_config)
        
        # Select agent
        agent = search_agent if request.agent_type == "search" else chat_agent
        
        if agent is None:
            raise HTTPException(status_code=500, detail="Failed to initialize agent")
        
        # Execute agent
        response = await agent.execute(request.message)
        
        return ChatResponse(
            success=response.success,
            response=response.content,
            agent_type=request.agent_type,
            capabilities=agent.get_capabilities(),
            metadata=response.metadata,
            error=response.error
        )
        
    except Exception as e:
        logger.error(f"Error in chat endpoint: {e}")
        return ChatResponse(
            success=False,
            response="",
            agent_type=request.agent_type,
            capabilities=[],
            error=str(e)
        )


@api_router.post("/search", response_model=SearchResponse)
async def search_and_summarize(request: SearchRequest):
    # Web search with AI summary
    global search_agent
    
    try:
        # Init search agent if needed
        if search_agent is None:
            search_agent = SearchAgent(agent_config)
        
        # Search with agent
        search_prompt = f"Search for information about: {request.query}. Provide a comprehensive summary with key findings."
        result = await search_agent.execute(search_prompt, use_tools=True)
        
        if result.success:
            return SearchResponse(
                success=True,
                query=request.query,
                summary=result.content,
                search_results=result.metadata,
                sources_count=result.metadata.get("tools_used", 0)
            )
        else:
            return SearchResponse(
                success=False,
                query=request.query,
                summary="",
                sources_count=0,
                error=result.error
            )
            
    except Exception as e:
        logger.error(f"Error in search endpoint: {e}")
        return SearchResponse(
            success=False,
            query=request.query,
            summary="",
            sources_count=0,
            error=str(e)
        )


@api_router.get("/agents/capabilities")
async def get_agent_capabilities():
    # Get agent capabilities
    try:
        capabilities = {
            "search_agent": SearchAgent(agent_config).get_capabilities(),
            "chat_agent": ChatAgent(agent_config).get_capabilities()
        }
        return {
            "success": True,
            "capabilities": capabilities
        }
    except Exception as e:
        logger.error(f"Error getting capabilities: {e}")
        return {
            "success": False,
            "error": str(e)
        }


@api_router.post("/wallpaper/generate", response_model=WallpaperResponse)
async def generate_wallpaper(request: WallpaperRequest):
    """Generate AI wallpaper - Returns sample/demo images for now"""
    try:
        # For demo purposes, return curated high-quality wallpapers based on prompt keywords
        sample_wallpapers = {
            "nature": [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=910&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=910&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=512&h=910&fit=crop&auto=format"
            ],
            "city": [
                "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=512&h=910&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=512&h=910&fit=crop&auto=format"
            ],
            "abstract": [
                "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=910&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1557683304-673a23048d34?w=512&h=910&fit=crop&auto=format"
            ],
            "space": [
                "https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=512&h=910&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=512&h=910&fit=crop&auto=format"
            ],
            "dark": [
                "https://images.unsplash.com/photo-1618556450991-2f1af64e8191?w=512&h=910&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=512&h=910&fit=crop&auto=format"
            ],
            "minimal": [
                "https://images.unsplash.com/photo-1557683316-973673baf926?w=512&h=910&fit=crop&auto=format",
                "https://images.unsplash.com/photo-1574169208507-84376144848b?w=512&h=910&fit=crop&auto=format"
            ]
        }

        # Default wallpapers for any prompt
        default_wallpapers = [
            "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=512&h=910&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=512&h=910&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=512&h=910&fit=crop&auto=format",
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=512&h=910&fit=crop&auto=format"
        ]

        # Determine which category to use based on prompt and style
        prompt_lower = request.prompt.lower()
        style_lower = (request.style or "").lower()

        combined_text = f"{prompt_lower} {style_lower}"

        selected_wallpapers = default_wallpapers

        for category, wallpapers in sample_wallpapers.items():
            if category in combined_text:
                selected_wallpapers = wallpapers
                break

        # Select a wallpaper based on prompt hash for consistency
        import hashlib
        prompt_hash = hashlib.md5(request.prompt.encode()).hexdigest()
        wallpaper_index = int(prompt_hash[:2], 16) % len(selected_wallpapers)
        selected_wallpaper = selected_wallpapers[wallpaper_index]

        # Adjust dimensions based on aspect ratio
        if request.aspect_ratio == "16:9":
            selected_wallpaper = selected_wallpaper.replace("w=512&h=910", "w=910&h=512")
        elif request.aspect_ratio == "1:1":
            selected_wallpaper = selected_wallpaper.replace("w=512&h=910", "w=512&h=512")
        elif request.aspect_ratio == "3:4":
            selected_wallpaper = selected_wallpaper.replace("w=512&h=910", "w=512&h=683")

        return WallpaperResponse(
            success=True,
            image_url=selected_wallpaper,
            prompt=request.prompt,
            aspect_ratio=request.aspect_ratio
        )

    except Exception as e:
        logger.error(f"Error generating wallpaper: {e}")
        return WallpaperResponse(
            success=False,
            prompt=request.prompt,
            aspect_ratio=request.aspect_ratio,
            error=str(e)
        )

# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logging config
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_event():
    # Initialize agents on startup
    global search_agent, chat_agent
    logger.info("Starting AI Agents API...")
    
    # Lazy agent init for faster startup
    logger.info("AI Agents API ready!")


@app.on_event("shutdown")
async def shutdown_db_client():
    # Cleanup on shutdown
    global search_agent, chat_agent
    
    # Close MCP
    if search_agent and search_agent.mcp_client:
        # MCP cleanup automatic
        pass
    
    client.close()
    logger.info("AI Agents API shutdown complete.")
