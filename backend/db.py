# backend/db.py
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from datetime import datetime
import os

DB_PATH = os.getenv("DB_PATH", "sqlite:///./data/app.db")
os.makedirs("./data", exist_ok=True)

engine = create_engine(DB_PATH, future=True)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False)
Base = declarative_base()

class Case(Base):
    __tablename__ = "cases"
    id = Column(Integer, primary_key=True)
    status = Column(String(32), default="OPEN")
    verdict = Column(String(32), default=None)
    confidence = Column(String(16), default=None)
    client_email = Column(String(255), default=None)
    client_phone = Column(String(64), default=None)
    created_at = Column(DateTime, default=datetime.utcnow)
    messages = relationship("Message", back_populates="case", cascade="all,delete-orphan")
    evidence = relationship("Evidence", back_populates="case", cascade="all,delete-orphan")

class Message(Base):
    __tablename__ = "messages"
    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    who = Column(String(8))          # 'user' or 'ai'
    text = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="messages")

class Evidence(Base):
    __tablename__ = "evidence"
    id = Column(Integer, primary_key=True)
    case_id = Column(Integer, ForeignKey("cases.id"))
    filename = Column(String(255))
    path = Column(String(512))
    ocr_method = Column(String(32))
    pages = Column(Integer, default=0)
    excerpt = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    case = relationship("Case", back_populates="evidence")

class Staff(Base):
    __tablename__ = "staff"
    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, index=True)
    password_hash = Column(String(255))
    role = Column(String(16), default="STAFF")  # 'ADMIN' or 'STAFF'
    created_at = Column(DateTime, default=datetime.utcnow)

def init_db():
    Base.metadata.create_all(engine)
    # safe ALTERs for existing DBs
    with engine.connect() as conn:
        try: conn.exec_driver_sql("ALTER TABLE cases ADD COLUMN client_email VARCHAR(255)")
        except Exception: pass
        try: conn.exec_driver_sql("ALTER TABLE cases ADD COLUMN client_phone VARCHAR(64)")
        except Exception: pass
        try: conn.exec_driver_sql("ALTER TABLE cases ADD COLUMN contact_name VARCHAR(255)")
        except Exception: pass
        try: conn.exec_driver_sql("ALTER TABLE cases ADD COLUMN contact_phone VARCHAR(64)")
        except Exception: pass
        try: conn.exec_driver_sql("ALTER TABLE cases ADD COLUMN contact_email VARCHAR(255)")
        except Exception: pass