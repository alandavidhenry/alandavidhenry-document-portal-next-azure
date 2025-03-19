output "resource_group_name" {
  description = "The name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "app_service_name" {
  description = "The name of the App Service"
  value       = azurerm_linux_web_app.main.name
}

output "app_service_url" {
  description = "The URL of the App Service"
  value       = "https://${azurerm_linux_web_app.main.default_hostname}"
}

output "application_id" {
  description = "The Application (Client) ID for Azure AD"
  value       = azuread_application.document_portal.client_id
  sensitive   = false
}

output "client_secret" {
  description = "The Application Client Secret"
  value       = azuread_application_password.document_portal.value
  sensitive   = true
}

output "storage_connection_string" {
  description = "Azure Storage Connection String"
  value       = azurerm_storage_account.documents.primary_connection_string
  sensitive   = true
}

output "tenant_id" {
  description = "Azure AD Tenant ID"
  value       = data.azurerm_client_config.current.tenant_id
  sensitive   = false
}

output "nextauth_secret" {
  description = "The NextAuth Secret"
  value       = random_password.nextauth_secret.result
  sensitive   = true
}

output "storage_container_name" {
  description = "The Storage Container Name"
  value       = azurerm_storage_container.documents.name
  sensitive   = false
}
