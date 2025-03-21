# Configure backend in main.tf
terraform {
  backend "azurerm" {}
}

# Get current client configuration
data "azurerm_client_config" "current" {}

# Create resource names using Azure CAF
resource "azurecaf_name" "rg" {
  name          = var.project
  resource_type = "azurerm_resource_group"
  suffixes      = [var.environment]
}

resource "azurecaf_name" "key_vault" {
  name          = local.kv_project_name
  resource_type = "azurerm_key_vault"
  suffixes      = [var.environment]
}

resource "azurecaf_name" "storage_docs" {
  name          = var.project
  resource_type = "azurerm_storage_account"
  suffixes      = [var.environment, "docs"]
}

resource "azurecaf_name" "app_service" {
  name          = var.project
  resource_type = "azurerm_app_service"
  suffixes      = [var.environment]
}

resource "azurecaf_name" "app_service_plan" {
  name          = var.project
  resource_type = "azurerm_app_service_plan"
  suffixes      = [var.environment]
}

# Create random password for the NextAuth secret
resource "random_password" "nextauth_secret" {
  length      = 32
  special     = true
  min_special = 1
  min_upper   = 1
  min_lower   = 1
  min_numeric = 1
  # Only create this on first run
  keepers = {
    first_run = "true"
  }
}

# Create resource group
resource "azurerm_resource_group" "main" {
  name     = coalesce(var.resource_group_name, azurecaf_name.rg.result)
  location = var.location

  tags = local.common_tags
}

# Create Azure Key Vault
resource "azurerm_key_vault" "main" {
  name                = azurecaf_name.key_vault.result
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Grant the current user full access to the Key Vault
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Purge", "Recover"
    ]
  }

  tags = local.common_tags
}

# Store the client secret in Key Vault
resource "azurerm_key_vault_secret" "ad_client_secret" {
  name         = "azure-ad-client-secret"
  value        = azuread_application_password.document_portal.value
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [
    azurerm_key_vault.main
  ]
}

# Store the NextAuth secret in Key Vault
resource "azurerm_key_vault_secret" "nextauth_secret" {
  name         = "nextauth-secret"
  value        = random_password.nextauth_secret.result
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [
    azurerm_key_vault.main
  ]
}

# Create document storage account
resource "azurerm_storage_account" "documents" {
  name                     = azurecaf_name.storage_docs.result
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = var.storage.account_tier
  account_replication_type = var.storage.account_replication_type
  min_tls_version          = var.storage.min_tls_version

  blob_properties {
    cors_rule {
      allowed_headers    = ["*"]
      allowed_methods    = ["GET", "HEAD", "OPTIONS"]
      allowed_origins    = ["https://app-document-portal-next-azure-dev.azurewebsites.net"]
      exposed_headers    = ["*"]
      max_age_in_seconds = 86400
    }
  }

  tags = local.common_tags
}

# Create document storage account container
resource "azurerm_storage_container" "documents" {
  name                  = var.storage_container.name
  storage_account_id    = azurerm_storage_account.documents.id
  container_access_type = var.storage_container.container_access_type
}

# Store the storage connection string in Key Vault
resource "azurerm_key_vault_secret" "storage_connection_string" {
  name         = "storage-connection-string"
  value        = azurerm_storage_account.documents.primary_connection_string
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [
    azurerm_key_vault.main
  ]
}

# Create App Service Plan
resource "azurerm_service_plan" "main" {
  name                = azurecaf_name.app_service_plan.result
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = var.app_service_sku

  tags = local.common_tags
}

# Create App Service
resource "azurerm_linux_web_app" "main" {
  name                = azurecaf_name.app_service.result
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id

  identity {
    type = "SystemAssigned"
  }

  site_config {
    application_stack {
      docker_image_name        = "ghcr.io/${var.github_username}/${var.project}:latest"
      docker_registry_url      = "https://ghcr.io"
      docker_registry_username = var.github_username
      docker_registry_password = var.github_token
    }
    always_on = contains(["F1", "FREE", "D1"], var.app_service_sku) ? false : true

    health_check_path                 = "/api/health"
    health_check_eviction_time_in_min = 10
  }

  logs {
    detailed_error_messages = false
    failed_request_tracing  = false

    http_logs {
      file_system {
        retention_in_days = 7
        retention_in_mb   = 35
      }
    }
  }

  app_settings = {
    "WEBSITES_PORT"                   = "8080"
    "AZURE_AD_CLIENT_ID"              = azuread_application.document_portal.client_id
    "AZURE_AD_TENANT_ID"              = data.azurerm_client_config.current.tenant_id
    "AZURE_AD_CLIENT_SECRET"          = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.ad_client_secret.versionless_id})"
    "AZURE_STORAGE_CONNECTION_STRING" = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.storage_connection_string.versionless_id})"
    "AZURE_STORAGE_CONTAINER_NAME"    = azurerm_storage_container.documents.name
    "NEXTAUTH_URL"                    = "https://${azurecaf_name.app_service.result}.azurewebsites.net"
    "NEXTAUTH_SECRET"                 = "@Microsoft.KeyVault(SecretUri=${azurerm_key_vault_secret.nextauth_secret.versionless_id})"
    "WEBSITE_NODE_DEFAULT_VERSION"    = "~20"
    "SCM_DO_BUILD_DURING_DEPLOYMENT"  = "true"
  }

  tags = local.common_tags
}

resource "azurerm_key_vault_access_policy" "app_service" {
  key_vault_id = azurerm_key_vault.main.id
  tenant_id    = data.azurerm_client_config.current.tenant_id
  object_id    = azurerm_linux_web_app.main.identity[0].principal_id

  secret_permissions = [
    "Get", "List"
  ]

  depends_on = [
    azurerm_key_vault.main,
    azurerm_linux_web_app.main
  ]
}

# Create Azure AD application
resource "azuread_application" "document_portal" {
  display_name = "${var.project}-${var.environment}"

  web {
    redirect_uris = concat(var.redirect_uris, ["https://${azurecaf_name.app_service.result}.azurewebsites.net/api/auth/callback/azure-ad"])
    implicit_grant {
      access_token_issuance_enabled = false
      id_token_issuance_enabled     = true
    }
  }
}

# Create service principal
resource "azuread_service_principal" "document_portal" {
  client_id = azuread_application.document_portal.client_id
}

# Create client secret
resource "azuread_application_password" "document_portal" {
  application_id = azuread_application.document_portal.id
  display_name   = "Terraform Managed Secret"
  end_date       = var.azure_ad.password_end_date
}
