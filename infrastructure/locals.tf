locals {
  common_tags = {
    Environment = var.environment
    Project     = var.project
    CreatedBy   = "IaC"
  }
  kv_project_name = replace(substr(var.project, 0, 16), "-", "") # Create a shortened project name for key vault
}