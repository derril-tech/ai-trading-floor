# Created automatically by Cursor AI (2024-01-XX)
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON, ForeignKey, Boolean, Float, Index, BigInteger
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, ENUM
from sqlalchemy.sql import func
from app.models.base import Base
import uuid
from enum import Enum

class OrganizationStatus(str, Enum):
    ACTIVE = "active"
    SUSPENDED = "suspended"
    INACTIVE = "inactive"
    PENDING = "pending"

class UserRole(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    QUANT = "quant"
    STRATEGIST = "strategist"
    RISK = "risk"
    COMPLIANCE = "compliance"
    VIEWER = "viewer"
    TRADER = "trader"

class AuditAction(str, Enum):
    CREATE = "create"
    READ = "read"
    UPDATE = "update"
    DELETE = "delete"
    LOGIN = "login"
    LOGOUT = "logout"
    EXPORT = "export"
    IMPORT = "import"
    APPROVE = "approve"
    REJECT = "reject"
    EXECUTE = "execute"
    CANCEL = "cancel"

class ReportType(str, Enum):
    DAILY_PNL = "daily_pnl"
    RISK_REPORT = "risk_report"
    COMPLIANCE_REPORT = "compliance_report"
    PERFORMANCE_REPORT = "performance_report"
    TRADE_REPORT = "trade_report"
    AUDIT_REPORT = "audit_report"
    EXECUTIVE_SUMMARY = "executive_summary"

class Organization(Base):
    __tablename__ = "organizations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    status = Column(ENUM(OrganizationStatus), default=OrganizationStatus.PENDING)
    settings = Column(JSON, default={})
    limits = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    users = relationship("User", back_populates="organization")
    audit_logs = relationship("AuditLog", back_populates="organization")
    reports = relationship("Report", back_populates="organization")
    api_keys = relationship("APIKey", back_populates="organization")
    
    __table_args__ = (
        Index('idx_organizations_slug', 'slug'),
        Index('idx_organizations_status', 'status'),
    )

class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    username = Column(String(100), unique=True, nullable=False)
    first_name = Column(String(100))
    last_name = Column(String(100))
    role = Column(ENUM(UserRole), default=UserRole.VIEWER)
    is_active = Column(Boolean, default=True)
    last_login = Column(DateTime(timezone=True))
    preferences = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="users")
    audit_logs = relationship("AuditLog", back_populates="user")
    api_keys = relationship("APIKey", back_populates="user")
    
    __table_args__ = (
        Index('idx_users_organization_id', 'organization_id'),
        Index('idx_users_email', 'email'),
        Index('idx_users_role', 'role'),
    )

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    action = Column(ENUM(AuditAction), nullable=False)
    resource_type = Column(String(100), nullable=False)
    resource_id = Column(String(255))
    details = Column(JSON, default={})
    ip_address = Column(String(45))
    user_agent = Column(Text)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")
    
    __table_args__ = (
        Index('idx_audit_logs_organization_id', 'organization_id'),
        Index('idx_audit_logs_user_id', 'user_id'),
        Index('idx_audit_logs_action', 'action'),
        Index('idx_audit_logs_timestamp', 'timestamp'),
        Index('idx_audit_logs_resource', 'resource_type', 'resource_id'),
    )

class APIKey(Base):
    __tablename__ = "api_keys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    name = Column(String(255), nullable=False)
    key_hash = Column(String(255), unique=True, nullable=False)
    permissions = Column(JSON, default=[])
    rate_limit = Column(Integer, default=1000)  # requests per hour
    is_active = Column(Boolean, default=True)
    last_used = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="api_keys")
    user = relationship("User", back_populates="api_keys")
    
    __table_args__ = (
        Index('idx_api_keys_organization_id', 'organization_id'),
        Index('idx_api_keys_user_id', 'user_id'),
        Index('idx_api_keys_key_hash', 'key_hash'),
        Index('idx_api_keys_active', 'is_active'),
    )

class Report(Base):
    __tablename__ = "reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    report_type = Column(ENUM(ReportType), nullable=False)
    parameters = Column(JSON, default={})
    status = Column(String(50), default="pending")  # pending, generating, completed, failed
    file_path = Column(String(500))
    file_size = Column(Integer)
    generated_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    generated_at = Column(DateTime(timezone=True))
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    organization = relationship("Organization", back_populates="reports")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_reports_organization_id', 'organization_id'),
        Index('idx_reports_type', 'report_type'),
        Index('idx_reports_status', 'status'),
        Index('idx_reports_generated_at', 'generated_at'),
    )

class RateLimit(Base):
    __tablename__ = "rate_limits"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    endpoint = Column(String(255), nullable=False)
    window_start = Column(DateTime(timezone=True), nullable=False)
    request_count = Column(Integer, default=0)
    limit = Column(Integer, nullable=False)
    
    __table_args__ = (
        Index('idx_rate_limits_organization_endpoint', 'organization_id', 'endpoint'),
        Index('idx_rate_limits_window', 'window_start'),
    )

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(String(50), default="info")  # info, warning, error, success
    is_read = Column(Boolean, default=False)
    data = Column(JSON, default={})
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    organization = relationship("Organization")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_notifications_organization_id', 'organization_id'),
        Index('idx_notifications_user_id', 'user_id'),
        Index('idx_notifications_read', 'is_read'),
        Index('idx_notifications_created_at', 'created_at'),
    )

class Subscription(Base):
    __tablename__ = "subscriptions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    plan_name = Column(String(100), nullable=False)
    features = Column(JSON, default=[])
    limits = Column(JSON, default={})
    price = Column(Float, nullable=False)
    currency = Column(String(3), default="USD")
    billing_cycle = Column(String(20), default="monthly")  # monthly, quarterly, yearly
    status = Column(String(50), default="active")  # active, cancelled, suspended
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True))
    auto_renew = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization")
    
    __table_args__ = (
        Index('idx_subscriptions_organization_id', 'organization_id'),
        Index('idx_subscriptions_status', 'status'),
        Index('idx_subscriptions_end_date', 'end_date'),
    )

class DataUsage(Base):
    __tablename__ = "data_usage"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    date = Column(DateTime(timezone=True), nullable=False)
    data_type = Column(String(100), nullable=False)  # market_data, alternative_data, etc.
    usage_count = Column(Integer, default=0)
    usage_bytes = Column(BigInteger, default=0)
    cost = Column(Float, default=0.0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    organization = relationship("Organization")
    
    __table_args__ = (
        Index('idx_data_usage_organization_date', 'organization_id', 'date'),
        Index('idx_data_usage_type', 'data_type'),
    )

class ComplianceRule(Base):
    __tablename__ = "compliance_rules"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    organization_id = Column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    rule_type = Column(String(100), nullable=False)  # position_limit, sector_limit, etc.
    conditions = Column(JSON, nullable=False)
    actions = Column(JSON, nullable=False)
    priority = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    organization = relationship("Organization")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_compliance_rules_organization_id', 'organization_id'),
        Index('idx_compliance_rules_type', 'rule_type'),
        Index('idx_compliance_rules_active', 'is_active'),
        Index('idx_compliance_rules_priority', 'priority'),
    )
