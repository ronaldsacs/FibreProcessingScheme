from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, JSON, DateTime
from sqlalchemy.dialects.postgresql import UUID
import uuid
from database import Base

class UserProject(Base):
    __tablename__ = "User_Projects"
    project_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_name = Column(String(255), nullable=False)
    target_capacity_adt = Column(Integer, nullable=False)

class FurnishSpecification(Base):
    __tablename__ = "Furnish_Specifications"
    furnish_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)
    base_yield_factor = Column(Numeric(3,2), default=0.85)

class GeneratedScheme(Base):
    __tablename__ = "Generated_Schemes"
    scheme_id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id = Column(UUID(as_uuid=True), ForeignKey("User_Projects.project_id"))
    tier = Column(String(50), nullable=False)
    equipment_list_json = Column(JSON, nullable=False)
    pfd_topology_json = Column(JSON, nullable=False)
