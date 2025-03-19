variable "project" {
  description = "Project name"
  type        = string
  default     = "document-portal"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "UK South"
}

variable "resource_group_name" {
  description = "Resource group name"
  type        = string
  default     = null
}

variable "app_service_sku" {
  description = "App Service plan SKU"
  type        = string
  default     = "B1"
}

variable "redirect_uris" {
  description = "Redirect URIs for the application"
  type        = list(string)
  default = [
    "http://localhost:3000/api/auth/callback/azure-ad"
  ]
}

variable "key_vault" {
  description = "Key Vault configuration"
  type = object({
    sku_name = string
  })
  default = {
    sku_name = "standard"
  }
}

variable "storage" {
  description = "Storage account configuration"
  type = object({
    account_tier             = string
    account_replication_type = string
    min_tls_version          = string
  })
  default = {
    account_tier             = "Standard"
    account_replication_type = "LRS"
    min_tls_version          = "TLS1_2"
  }
}

variable "storage_container" {
  description = "Storage container configuration"
  type = object({
    name                  = string
    container_access_type = string
  })
  default = {
    name                  = "documents"
    container_access_type = "private"
  }
}

variable "azure_ad" {
  description = "Azure AD application configuration"
  type = object({
    password_end_date = string
  })
  default = {
    password_end_date = "2025-12-31T00:00:00Z"
  }
}

variable "github_username" {
  description = "GitHub username for container registry"
  type        = string
  sensitive   = false
}

variable "github_token" {
  description = "GitHub personal access token with package read permissions"
  type        = string
  sensitive   = true
}
