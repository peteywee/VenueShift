#!/bin/bash

# generate_project.sh
# Idempotently generates the initial project structure and boilerplate files
# for the VenueShift application based on previous discussions and documents.
# Includes interactive error handling for file generation.
# Run this script from the intended project root directory.

echo "Starting project structure generation..."
echo "Assuming this script is run from the desired project root directory."
echo "Using relative paths for file generation."

# --- Create Directories ---
# Use mkdir -p which is idempotent (doesn't error if exists) and creates parent dirs.
# Exit if critical directories cannot be created.
echo "-------------------------------------"
echo "Creating base directories..."
mkdir -p infra/oci || { echo "ERROR: Failed to create infra/oci directory. Exiting."; exit 1; }
mkdir -p docs || { echo "ERROR: Failed to create docs directory. Exiting."; exit 1; }
mkdir -p scripts || { echo "ERROR: Failed to create scripts directory. Exiting."; exit 1; }
mkdir -p packages/backend/src || { echo "ERROR: Failed to create packages/backend/src directory. Exiting."; exit 1; }
mkdir -p packages/frontend/src || { echo "ERROR: Failed to create packages/frontend/src directory. Exiting."; exit 1; }
mkdir -p packages/frontend/public || { echo "ERROR: Failed to create packages/frontend/public directory. Exiting."; exit 1; }
mkdir -p .github/workflows || { echo "ERROR: Failed to create .github/workflows directory. Exiting."; exit 1; }
echo "Base directories checked/created."
echo "-------------------------------------"

# --- Helper Function to Generate File ---
# Usage: generate_file "path/to/file.ext" << 'EOF'
# Content for the file
# EOF
generate_file() {
  local file_path="$1"
  # Use relative paths directly, assuming script is run from project root.

  if [ -f "$file_path" ]; then
    echo "- $file_path already exists. Skipping."
  else
    echo "+ Generating $file_path..."
    # Use 'EOF' with quotes to prevent variable/command substitution within the heredoc content
    # This ensures the content is written exactly as provided.
    if ! cat << 'EOF' > "$file_path"; then
$(cat)
EOF
      # Check exit status of the cat > redirect operation
      echo "" # Newline for clarity
      echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" >&2 # Error to stderr
      echo "ERROR: Failed to generate $file_path." >&2
      echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" >&2
      # Make it interactive
      read -p "An error occurred writing the file. Continue with the rest of the script? (y/N) " -n 1 -r REPLY
      echo # Move to new line after read
      if [[ ! $REPLY =~ ^[Yy]$ ]]; then
          echo "Exiting script due to error."
          exit 1
      else
          echo "Continuing script despite error generating $file_path..."
      fi
    fi
  fi
}

# --- Generate Root Files ---
echo "Generating root files..."

generate_file "README.md" << 'EOF'
# VenueShift Application (MVP)

## Overview

VenueShift is a modern web application designed for [Your App's Purpose - e.g., managing venue bookings, event scheduling]. This repository contains the Minimum Viable Product (MVP) implementation.

This project emphasizes best practices, cost-efficiency (leveraging cloud free tiers), security, and automation from the outset.

## Goals

* Build a functional MVP demonstrating core features.
* Establish a robust, reproducible infrastructure using Terraform on OCI.
* Implement a secure authentication system using Firebase Authentication.
* Utilize Cloudflare for performant frontend hosting and secure backend access.
* Lay the foundation for future features like geolocation, real-time messaging, and administrative insights.

## Technology Stack

| Category           | Technology                                        | Notes                                                    |
| :----------------- | :------------------------------------------------ | :------------------------------------------------------- |
| Compute            | OCI Compute VM (Ampere A1 Always Free)            | Hosts backend API, Nginx, PM2, Cloudflared               |
| Frontend Hosting   | Cloudflare Pages                                  | Global CDN, Git-based deployment, Free tier              |
| Database           | OCI Autonomous DB (PostgreSQL Mode, Always Free)  | Managed DB, Free tier, PG compatible                     |
| Authentication     | Firebase Authentication                           | Managed, Secure, Easy SDKs, Free tier                    |
| Secrets            | OCI Vault                                         | Secure secret storage, integrates with VM via Instance Principals |
| Container Registry | OCI Container Registry (OCIR)                     | Stores backend Docker images, Free tier                  |
| Entry Point/CDN    | Cloudflare (Pages + Tunnel)                       | Secure ingress, performance, necessary for private VM    |
| IaC                | Terraform (OCI Provider)                          | Infrastructure as Code, reproducible setup               |
| CI/CD              | GitHub Actions                                    | Automation for build, test, deploy; Free tier            |
| Process Management | `pm2` (on VM)                                     | Node.js process management, reliability                  |
| Reverse Proxy      | `nginx` (on VM)                                   | Routes traffic from Tunnel to Node app, security headers |
| Backend Framework  | Node.js, Express, TypeScript                      |                                                          |
| Frontend Framework | React, Vite, TypeScript, Shadcn UI, Tailwind CSS  |                                                          |
| ORM                | Drizzle ORM                                       |                                                          |

## Getting Started

1.  **Prerequisites:** Ensure you have Git, Node.js (with npm/yarn), Terraform, an OCI account, a Cloudflare account, and an SSH key pair installed/configured locally.
2.  **Setup:** Follow the detailed instructions in the [**SETUP_GUIDE.md**](./docs/SETUP_GUIDE.md) to clone the repository, configure credentials, provision infrastructure, and set up the VM.
3.  **Run Locally (Limited):** Due to the OCI VM dependency, full local execution isn't feasible. Frontend development can be done locally (`npm run dev` in `/packages/frontend`). Backend development requires deploying to the OCI VM.

## Development Workflow

Application features are developed in layers after the initial infrastructure setup. See the [**DEVELOPMENT_WORKFLOW.md**](./docs/DEVELOPMENT_WORKFLOW.md) for details on the layered approach.

## Deployment

Frontend code is deployed to Cloudflare Pages, and backend code is deployed to the OCI VM. See the [**DEPLOYMENT_GUIDE.md**](./docs/DEPLOYMENT_GUIDE.md) for procedures.

## Security

Security considerations are paramount. Refer to the [**SECURITY_GUIDE.md**](./docs/SECURITY_GUIDE.md) for details on authentication, authorization, secrets management, network security, and best practices.

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.
EOF

generate_file ".gitignore" << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Diagnostic reports (https://nodejs.org/api/report.html)
report.[0-9]*.[0-9]*.[0-9]*.[0-9]*.json

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Directory for instrumented libs generated by jscoverage/JSCover
lib-cov

# Coverage directory used by tools like istanbul
coverage
*.lcov

# nyc test coverage
.nyc_output

# Grunt intermediate storage (https://gruntjs.com/creating-plugins#storing-task-files)
.grunt

# Bower dependency directory (https://bower.io/)
bower_components

# node-waf configuration
.lock-wscript

# Compiled binary addons (https://nodejs.org/api/addons.html)
build/Release

# Dependency directories
node_modules/
jspm_packages/

# Snowpack dependency directory (https://snowpack.dev/)
web_modules/

# TypeScript cache
*.tsbuildinfo

# Optional npm cache directory
.npm

# Optional eslint cache
.eslintcache

# Optional stylelint cache
.stylelintcache

# Microbundle cache
.rpt2_cache/
.rts2_cache_cjs/
.rts2_cache_es/
.rts2_cache_umd/

# Optional REPL history
.node_repl_history

# Output of 'npm pack'
*.tgz

# Yarn Integrity file
.yarn-integrity

# dotenv environment variables file
.env
.env.*
!.env.example

# parcel-bundler cache (https://parceljs.org/)
.cache
.parcel-cache

# Next.js build output
.next
out

# Nuxt.js build output
.nuxt
dist

# Remix build output
.cache/
build/
public/build/

# Docusaurus cache and generated files
.docusaurus

# Gatsby cache and generated files
.cache/
public

# SvelteKit build output
.svelte-kit

# Strapi build output
.cache
build

# Build directories
dist/
build/
out/

# IDE directories for VS Code, JetBrains, Sublime Text, etc.
.vscode/
.idea/
*.sublime-project
*.sublime-workspace

# OS generated files
.DS_Store
Thumbs.db
Desktop.ini

# Terraform files
infra/oci/.terraform/
infra/oci/*.tfstate
infra/oci/*.tfstate.*
infra/oci/crash.log
infra/oci/*.tfvars
infra/oci/override.tf
infra/oci/override.tf.json
infra/oci/*_override.tf
infra/oci/*_override.tf.json
infra/oci/*.tfplan

# OCI Keys / Sensitive Config
*.pem
~/.oci/config

# Scripts output/temp files (if any)
# (Add specific script outputs here if necessary)

# Cloudflare specific
.wrangler/
EOF

generate_file "LICENSE" << 'EOF'
MIT License

Copyright (c) 2024 [Your Name or Company Name]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
EOF

generate_file "CONTRIBUTING.md" << 'EOF'
# Contributing to VenueShift

First off, thank you for considering contributing! Your help is appreciated.

## Code of Conduct

This project and everyone participating in it is governed by a Code of Conduct (link to be added or defined). By participating, you are expected to uphold this code. Please report unacceptable behavior.

## How Can I Contribute?

* **Reporting Bugs:** If you find a bug, please ensure the bug was not already reported by searching on GitHub under Issues. If you're unable to find an open issue addressing the problem, open a new one. Be sure to include a title and clear description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.
* **Suggesting Enhancements:** Open an issue with the label `enhancement`. Provide a clear description of the enhancement, why it's needed, and potential implementation ideas.
* **Pull Requests:**
    1.  Fork the repo and create your branch from `main`.
    2.  If you've added code that should be tested, add tests.
    3.  If you've changed APIs, update the documentation.
    4.  Ensure the test suite passes (`npm test` or relevant command).
    5.  Make sure your code lints (`npm run lint`).
    6.  Issue that pull request!

## Development Setup

Follow the instructions in `docs/SETUP_GUIDE.md` to get your development environment ready.

## Coding Standards

* **Style:** Follow standard TypeScript/JavaScript/React/Node.js conventions. Use Prettier (config included) and ESLint (config included) for formatting and linting.
* **Commits:** Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification. This helps in automating changelogs and understanding project history. Example: `feat: Add venue creation endpoint` or `fix: Correct user profile update logic`.
* **Testing:** Add unit or integration tests for new features or bug fixes.

## Pull Request Process

1.  Ensure any install or build dependencies are removed before the end of the layer when doing a build.
2.  Update the README.md with details of changes to the interface, this includes new environment variables, exposed ports, useful file locations and container parameters.
3.  Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent.
4.  You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you.

Thank you for your contribution!
EOF

generate_file "Dockerfile" << 'EOF'
# Dockerfile for Backend Service (Example)
# This is a basic placeholder. You'll need to refine it based on your actual backend structure.

# Use an official Node.js runtime as a parent image (Choose version matching your development)
FROM node:20-slim

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock/pnpm-lock.yaml)
# Copy root package files if using monorepo/workspaces
COPY package*.json ./
# COPY pnpm-lock.yaml ./ # If using pnpm
# COPY packages/backend/package*.json ./packages/backend/

# Install app dependencies
# Use --only=production if you don't need devDependencies
# If using workspaces, adjust the install command (e.g., pnpm install --prod --filter backend)
RUN npm install --only=production
# RUN pnpm install --prod --filter backend # Example for pnpm workspaces

# Bundle backend source code
COPY ./packages/backend ./packages/backend

# Assume your build step compiles TypeScript to 'dist' within packages/backend
# RUN npm run build --workspace=backend # Or specific build command

# Expose the port the app runs on
EXPOSE 8080

# Define the command to run your app using the built JS file
# Adjust the path based on your build output structure
CMD [ "node", "packages/backend/dist/server/index.js" ]
EOF

echo "-------------------------------------"
echo "Generating infra/oci Terraform files..."

generate_file "infra/oci/main.tf" << 'EOF'
# main.tf
# Defines the Terraform provider configuration and required settings.

terraform {
  required_version = ">= 1.3.0" # Specify minimum Terraform version

  required_providers {
    oci = {
      source  = "oracle/oci"
      version = ">= 5.0.0" # Specify minimum OCI provider version
    }
  }
}

# Provider Configuration
# Assumes OCI credentials are configured via the OCI config file (~/.oci/config)
# as described in the SETUP_GUIDE.md.
# If not using the config file, you might need to add authentication arguments here.
provider "oci" {
  region = var.oci_region
  # tenancy_ocid = var.tenancy_ocid # Usually picked up from config file
  # user_ocid = var.user_ocid # Usually picked up from config file
  # fingerprint = var.fingerprint # Usually picked up from config file
  # private_key_path = var.private_key_path # Usually picked up from config file
}

# Define standard tags to apply to resources
locals {
  standard_tags = {
    Project     = var.project_name_prefix
    Environment = terraform.workspace # Use Terraform workspace name (e.g., "default", "dev", "prod")
    ManagedBy   = "Terraform"
  }
}
EOF

generate_file "infra/oci/variables.tf" << 'EOF'
# variables.tf
# Defines input variables for the Terraform configuration.
# Values should be provided in a terraform.tfvars file (NOT committed to Git)
# or via environment variables (TF_VAR_...).

variable "tenancy_ocid" {
  type        = string
  description = "The OCID of your OCI tenancy."
  # Sensitive because it identifies your account boundary, though not a secret itself.
  # Often picked up from ~/.oci/config, but good to have as a variable if needed.
  # sensitive   = true
}

variable "compartment_ocid" {
  type        = string
  description = "The OCID of the compartment where resources will be created."
}

variable "oci_region" {
  type        = string
  description = "The OCI region where resources will be created (e.g., us-ashburn-1)."
}

variable "user_ocid" {
  type        = string
  description = "The OCID of the OCI user running Terraform (used for API key association if needed)."
  # Often picked up from ~/.oci/config.
  # sensitive   = true
}

variable "ssh_public_key" {
  type        = string
  description = "The content of the public SSH key used for accessing the compute instance."
  # Not technically sensitive, but can be long.
}

variable "db_admin_password" {
  type        = string
  description = "The password for the Autonomous Database administrator user."
  sensitive   = true
}

variable "session_secret_value" {
  type        = string
  description = "A strong, random secret string for Express session management."
  sensitive   = true
}

variable "vm_image_ocid" {
  type        = string
  description = "The OCID of the ARM-based OS image to use for the compute instance (e.g., Oracle Linux or Ubuntu ARM)."
}

variable "project_name_prefix" {
  type        = string
  description = "A prefix used for naming resources (e.g., 'venues-mvp')."
  default     = "venues-mvp"
}

variable "db_name" {
  type        = string
  description = "The name for the Autonomous Database."
  default     = "venuesdb"
}

variable "db_display_name" {
  type        = string
  description = "The display name for the Autonomous Database."
  default     = "VenuesApp ADB PG"
}

variable "vm_shape" {
  type        = string
  description = "The shape for the OCI Compute Instance (Always Free ARM)."
  default     = "VM.Standard.A1.Flex"
}

variable "vm_ocpus" {
  type        = number
  description = "The number of OCPUs for the Flex VM shape (Always Free)."
  default     = 1 # Adjust based on Always Free limits if needed
}

variable "vm_memory_in_gbs" {
  type        = number
  description = "The amount of memory in GBs for the Flex VM shape (Always Free)."
  default     = 6 # Adjust based on Always Free limits if needed
}

variable "vcn_cidr_block" {
  type        = string
  description = "The CIDR block for the Virtual Cloud Network (VCN)."
  default     = "10.0.0.0/16"
}

variable "private_subnet_cidr_block" {
  type        = string
  description = "The CIDR block for the private subnet."
  default     = "10.0.1.0/24"
}

variable "vault_display_name" {
  type        = string
  description = "The display name for the OCI Vault."
  default     = "VenuesApp Vault"
}

variable "vault_key_display_name" {
  type        = string
  description = "The display name for the KMS Key within the Vault."
  default     = "VenuesApp Master Key"
}

variable "db_connection_secret_name" {
  type        = string
  description = "The name for the database connection string secret in the Vault."
  default     = "DB_CONNECTION_STRING"
}

variable "session_secret_name" {
  type        = string
  description = "The name for the session secret in the Vault."
  default     = "SESSION_SECRET"
}

variable "container_repo_name" {
  type        = string
  description = "The name for the OCI Container Registry repository."
  default     = "venues-backend"
}
EOF

generate_file "infra/oci/network.tf" << 'EOF'
# network.tf
# Defines OCI networking resources: VCN, Subnet, Gateways, Route Tables, NSGs.

# Virtual Cloud Network (VCN)
resource "oci_core_vcn" "vcn" {
  compartment_id = var.compartment_ocid
  cidr_block     = var.vcn_cidr_block
  display_name   = "${var.project_name_prefix}-vcn"
  dns_label      = lower(replace(var.project_name_prefix, "-", "")) # VCN DNS requires no hyphens
  freeform_tags  = local.standard_tags
}

# Internet Gateway (IGW) - Needed for NAT Gateway communication
resource "oci_core_internet_gateway" "igw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "${var.project_name_prefix}-igw"
  enabled        = true
  freeform_tags  = local.standard_tags
}

# NAT Gateway - Allows private subnet resources outbound internet access
resource "oci_core_nat_gateway" "nat_gw" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "${var.project_name_prefix}-nat-gw"
  freeform_tags  = local.standard_tags
}

# Route Table for Private Subnet (routes outbound via NAT Gateway)
resource "oci_core_route_table" "private_route_table" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "${var.project_name_prefix}-private-rt"
  freeform_tags  = local.standard_tags

  route_rules {
    destination       = "0.0.0.0/0"             # Route all outbound traffic
    destination_type  = "CIDR_BLOCK"
    network_entity_id = oci_core_nat_gateway.nat_gw.id # Via the NAT Gateway
  }
}

# Private Subnet - Hosts VM and Database
resource "oci_core_subnet" "private_subnet" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  cidr_block     = var.private_subnet_cidr_block
  display_name   = "${var.project_name_prefix}-private-subnet"
  dns_label      = "private"
  # Assign the private route table
  route_table_id = oci_core_route_table.private_route_table.id
  # Prohibit public IP assignment
  prohibit_public_ip_on_vnic = true
  # Security Lists are default, we use NSGs instead for finer control
  security_list_ids = [oci_core_vcn.vcn.default_security_list_id] # Can use default or create a minimal one
  freeform_tags     = local.standard_tags
}

# Network Security Group (NSG) for the Compute VM
resource "oci_core_network_security_group" "vm_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "${var.project_name_prefix}-vm-nsg"
  freeform_tags  = local.standard_tags
}

# Network Security Group (NSG) for the Autonomous Database
resource "oci_core_network_security_group" "db_nsg" {
  compartment_id = var.compartment_ocid
  vcn_id         = oci_core_vcn.vcn.id
  display_name   = "${var.project_name_prefix}-db-nsg"
  freeform_tags  = local.standard_tags
}

# --- NSG Rules ---

# Rule: Allow VM outbound internet access (HTTP/HTTPS) for updates, etc.
resource "oci_core_network_security_group_security_rule" "vm_egress_internet" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6" # TCP
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"

  tcp_options {
    destination_port_range {
      min = 80
      max = 80
    }
  }
  description = "Allow VM outbound HTTP"
}
resource "oci_core_network_security_group_security_rule" "vm_egress_internet_https" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6" # TCP
  destination               = "0.0.0.0/0"
  destination_type          = "CIDR_BLOCK"

  tcp_options {
    destination_port_range {
      min = 443
      max = 443
    }
  }
  description = "Allow VM outbound HTTPS"
}

# Rule: Allow VM outbound access to the Database NSG on PostgreSQL port (5432)
resource "oci_core_network_security_group_security_rule" "vm_egress_db" {
  network_security_group_id = oci_core_network_security_group.vm_nsg.id
  direction                 = "EGRESS"
  protocol                  = "6" # TCP
  destination               = oci_core_network_security_group.db_nsg.id # Target the DB NSG
  destination_type          = "NETWORK_SECURITY_GROUP"

  tcp_options {
    destination_port_range {
      min = 5432
      max = 5432
    }
  }
  description = "Allow VM egress to DB on PG port"
}

# Rule: Allow Database ingress from the VM NSG on PostgreSQL port (5432)
resource "oci_core_network_security_group_security_rule" "db_ingress_vm" {
  network_security_group_id = oci_core_network_security_group.db_nsg.id
  direction                 = "INGRESS"
  protocol                  = "6" # TCP
  source                    = oci_core_network_security_group.vm_nsg.id # Source is the VM NSG
  source_type               = "NETWORK_SECURITY_GROUP"

  tcp_options {
    destination_port_range {
      min = 5432
      max = 5432
    }
  }
  description = "Allow DB ingress from VM on PG port"
}

# Optional: Rule to allow SSH ingress to VM NSG (Restrict source CIDR!)
# resource "oci_core_network_security_group_security_rule" "vm_ingress_ssh" {
#   network_security_group_id = oci_core_network_security_group.vm_nsg.id
#   direction                 = "INGRESS"
#   protocol                  = "6" # TCP
#   source                    = "YOUR_SECURE_IP_CIDR" # e.g., "1.2.3.4/32" or OCI Bastion Service CIDR
#   source_type               = "CIDR_BLOCK"
#
#   tcp_options {
#     destination_port_range {
#       min = 22
#       max = 22
#     }
#   }
#   description = "Allow SSH ingress from specific IP (USE BASTION PREFERABLY)"
# }
EOF

generate_file "infra/oci/compute.tf" << 'EOF'
# compute.tf
# Defines the OCI Compute VM instance.

# Get Availability Domain (choose the first one in the list for simplicity)
data "oci_identity_availability_domains" "ads" {
  compartment_id = var.tenancy_ocid # Use tenancy OCID to list ADs
}

# Compute Instance (ARM Always Free Tier)
resource "oci_core_instance" "vm_instance" {
  compartment_id      = var.compartment_ocid
  availability_domain = data.oci_identity_availability_domains.ads.availability_domains[0].name
  shape               = var.vm_shape

  shape_config {
    ocpus         = var.vm_ocpus
    memory_in_gbs = var.vm_memory_in_gbs
  }

  display_name = "${var.project_name_prefix}-vm"
  freeform_tags = local.standard_tags

  source_details {
    source_type = "image"
    source_id   = var.vm_image_ocid # Specify the chosen ARM image OCID
  }

  create_vnic_details {
    subnet_id        = oci_core_subnet.private_subnet.id
    display_name     = "${var.project_name_prefix}-vm-vnic"
    assign_public_ip = false # Instance is in a private subnet
    # Assign the VM Network Security Group
    nsg_ids = [oci_core_network_security_group.vm_nsg.id]
  }

  metadata = {
    ssh_authorized_keys = var.ssh_public_key
    # Optional: Add user_data for cloud-init script execution
    # user_data = filebase64("${path.module}/../scripts/setup_vm.sh") # Example if using cloud-init
  }

  # Optional: Define block volume if needed beyond boot volume
  # ...

  # Ensure network resources are created before the instance
  depends_on = [
    oci_core_internet_gateway.igw,
    oci_core_nat_gateway.nat_gw,
    oci_core_subnet.private_subnet
  ]
}
EOF

generate_file "infra/oci/database.tf" << 'EOF'
# database.tf
# Defines the OCI Autonomous Database (PostgreSQL compatible).

resource "oci_database_autonomous_database" "adb_pg" {
  compartment_id      = var.compartment_ocid
  db_name             = var.db_name
  display_name        = var.db_display_name
  admin_password      = var.db_admin_password
  cpu_core_count      = 1               # Fixed for Always Free
  data_storage_size_in_tbs = 1          # Fixed for Always Free (check limits, usually GBs)
  data_storage_size_in_gbs = 20         # Always Free limit is typically 20GB
  is_free_tier        = true            # Enable Always Free tier
  db_workload         = "OLTP"          # Online Transaction Processing workload type
  license_model       = "LICENSE_INCLUDED" # Required for Always Free

  # PostgreSQL Compatibility Mode Settings (Confirm exact flags if needed)
  # The primary way to enable PG mode is during connection, but setting workload helps.
  # is_preview_version = false # Ensure not using a preview version unless intended

  # Network Configuration
  subnet_id = oci_core_subnet.private_subnet.id
  # Assign the Database Network Security Group
  nsg_ids = [oci_core_network_security_group.db_nsg.id]
  # Ensure private endpoint only
  is_mtls_connection_required = false # Typically false for private endpoints unless specific need
  private_endpoint_label      = lower(replace("${var.project_name_prefix}-adb", "-", "")) # DNS label needs no hyphens

  freeform_tags = local.standard_tags

  # Ensure subnet and NSG exist first
  depends_on = [
    oci_core_subnet.private_subnet,
    oci_core_network_security_group.db_nsg
  ]
}
EOF

generate_file "infra/oci/vault.tf" << 'EOF'
# vault.tf
# Defines OCI Vault, KMS Key, Secrets, Dynamic Group, and Policy for Instance Principals.

# Vault Resource
resource "oci_kms_vault" "vault" {
  compartment_id = var.compartment_ocid
  display_name   = var.vault_display_name
  vault_type     = "DEFAULT" # Or "VIRTUAL_PRIVATE" if needed, DEFAULT is typical
  freeform_tags  = local.standard_tags
}

# KMS Master Key within the Vault
resource "oci_kms_key" "key" {
  compartment_id = var.compartment_ocid
  display_name   = var.vault_key_display_name
  key_shape {
    algorithm = "AES"
    length    = 32 # AES-256
  }
  management_endpoint = oci_kms_vault.vault.management_endpoint
  protection_mode     = "HSM" # Or "SOFTWARE"
  freeform_tags       = local.standard_tags

  # Ensure vault exists first
  depends_on = [oci_kms_vault.vault]
}

# Secret entry for Database Connection String
# The actual value should be populated *after* apply, via Console/CLI/SDK
resource "oci_vault_secret" "db_connection_secret" {
  compartment_id  = var.compartment_ocid
  secret_name     = var.db_connection_secret_name
  vault_id        = oci_kms_vault.vault.id
  key_id          = oci_kms_key.key.id
  description     = "Stores the PostgreSQL connection string for the Venues App"
  freeform_tags   = local.standard_tags

  secret_content {
    content_type = "BASE64"
    # Provide a placeholder value, encoded in Base64.
    # Example: echo -n "placeholder" | base64 -> cGxhY2Vob2xkZXI=
    content = "cGxhY2Vob2xkZXI=" # Placeholder: "placeholder"
  }

  # Ensure key exists first
  depends_on = [oci_kms_key.key]
}

# Secret entry for Express Session Secret
resource "oci_vault_secret" "session_secret" {
  compartment_id  = var.compartment_ocid
  secret_name     = var.session_secret_name
  vault_id        = oci_kms_vault.vault.id
  key_id          = oci_kms_key.key.id
  description     = "Stores the Express session secret for the Venues App"
  freeform_tags   = local.standard_tags

  secret_content {
    content_type = "BASE64"
    # Use the sensitive variable value, Base64 encoded by Terraform
    content = base64encode(var.session_secret_value)
  }

  # Ensure key exists first
  depends_on = [oci_kms_key.key]
}

# --- Instance Principals Setup ---

# Dynamic Group matching the Compute Instance OCID
resource "oci_identity_dynamic_group" "vm_dynamic_group" {
  compartment_id = var.compartment_ocid # Or tenancy OCID if group is at root
  description    = "Dynamic group containing the Venues App VM instance"
  # Ensure instance is created before referencing its ID
  # Use sensitive = true if instance ID exposure is a concern, though usually okay
  matching_rule  = "resource.id = '${oci_core_instance.vm_instance.id}'"
  name           = "${var.project_name_prefix}-vm-dg"
  freeform_tags  = local.standard_tags

  # Ensure instance exists first
  depends_on = [oci_core_instance.vm_instance]
}

# IAM Policy granting the Dynamic Group permission to read secrets from the Vault
resource "oci_identity_policy" "vm_vault_read_policy" {
  compartment_id = var.compartment_ocid # Policy must be in the compartment containing the secrets (or higher)
  description    = "Policy allowing the Venues App VM dynamic group to read secrets from the vault"
  name           = "${var.project_name_prefix}-vm-vault-read-policy"
  statements = [
    # Allow reading secret *bundles* (the actual secret content)
    "Allow dynamic-group ${oci_identity_dynamic_group.vm_dynamic_group.name} to read secret-bundles in compartment id ${var.compartment_ocid} where target.vault.id = '${oci_kms_vault.vault.id}'",
    # Optional: Allow listing secrets if needed by SDK logic
    # "Allow dynamic-group ${oci_identity_dynamic_group.vm_dynamic_group.name} to inspect secrets in compartment id ${var.compartment_ocid} where target.vault.id = '${oci_kms_vault.vault.id}'"
  ]
  freeform_tags = local.standard_tags

  # Ensure dynamic group and vault exist first
  depends_on = [
    oci_identity_dynamic_group.vm_dynamic_group,
    oci_kms_vault.vault
  ]
}
EOF

generate_file "infra/oci/registry.tf" << 'EOF'
# registry.tf
# Defines the OCI Container Registry (OCIR) repository.

resource "oci_artifacts_container_repository" "container_repo" {
  compartment_id = var.compartment_ocid
  display_name   = var.container_repo_name
  is_public      = false # Keep it private
  # Optional: Add readme, etc.
  # readme {
  #   content = base64encode("Repository for the Venues App backend Docker images.")
  #   format = "TEXT_MARKDOWN"
  # }
  freeform_tags = local.standard_tags
}
EOF

generate_file "infra/oci/outputs.tf" << 'EOF'
# outputs.tf
# Defines outputs from the Terraform configuration.

output "vm_instance_id" {
  description = "The OCID of the created Compute VM instance."
  value       = oci_core_instance.vm_instance.id
}

output "vm_private_ip" {
  description = "The private IP address of the Compute VM instance."
  value       = oci_core_instance.vm_instance.private_ip
}

output "autonomous_db_id" {
  description = "The OCID of the Autonomous Database."
  value       = oci_database_autonomous_database.adb_pg.id
}

output "autonomous_db_connection_strings" {
  description = "Connection strings for the Autonomous Database (Note: Password not included)."
  value       = oci_database_autonomous_database.adb_pg.connection_strings
  sensitive   = true # Contains endpoint details
}

output "vault_id" {
  description = "The OCID of the OCI Vault."
  value       = oci_kms_vault.vault.id
}

output "kms_key_id" {
  description = "The OCID of the KMS Key."
  value       = oci_kms_key.key.id
}

output "container_repository_url" {
  description = "The URL of the OCI Container Repository."
  # Construct the URL based on your region and tenancy namespace (find in OCI Console -> OCIR)
  # Example format: <region-key>.ocir.io/<tenancy-namespace>/<repo-name>
  # You might need to query the tenancy namespace data source or input it as a variable.
  value = "Replace with your OCIR Repo URL format: <region-key>.ocir.io/<tenancy-namespace>/${oci_artifacts_container_repository.container_repo.display_name}"
}

output "vm_dynamic_group_name" {
  description = "The name of the Dynamic Group created for the VM."
  value       = oci_identity_dynamic_group.vm_dynamic_group.name
}

output "vm_vault_read_policy_name" {
  description = "The name of the IAM Policy allowing the VM to read secrets."
  value       = oci_identity_policy.vm_vault_read_policy.name
}
EOF

echo "-------------------------------------"
echo "Generating documentation files..."

generate_file "docs/ARCHITECTURE.md" << 'EOF'
# VenueShift - System Architecture

## 1. Introduction

This document outlines the architecture of the VenueShift MVP application. It leverages Oracle Cloud Infrastructure (OCI) for backend hosting and database services, Cloudflare for frontend delivery and secure access, and Firebase for authentication. The architecture prioritizes cost-effectiveness (using Always Free tiers), security, scalability, and maintainability using Infrastructure as Code (Terraform) and automated CI/CD (GitHub Actions).

## 2. Core Principles

* **Cloud Native:** Utilize cloud services for scalability and managed infrastructure where practical.
* **Cost Optimization:** Leverage OCI Always Free tiers and Cloudflare's free offerings extensively.
* **Security by Design:** Implement security at multiple layers (network, application, secrets).
* **Infrastructure as Code (IaC):** Use Terraform for reproducible and version-controlled infrastructure.
* **Automation:** Employ GitHub Actions for CI/CD to streamline development and deployment.
* **Modularity:** Separate frontend and backend concerns.

## 3. Components

### 3.1. Frontend

* **Technology:** React (Vite), TypeScript, Shadcn UI, Tailwind CSS, Wouter (routing).
* **Hosting:** **Cloudflare Pages**. Provides global CDN distribution, automated deployments from Git, custom domain support, and a generous free tier.
* **Functionality:** User interface for login, signup, venue browsing, creation, editing, etc. Interacts with the backend API and Firebase Authentication.

### 3.2. Backend

* **Technology:** Node.js, Express, TypeScript.
* **Runtime:** Runs as a Node.js process managed by `pm2` on an **OCI Compute VM (Ampere A1 Always Free)**.
* **API:** RESTful API endpoints for frontend interaction (e.g., `/api/users/me`, `/api/venues`).
* **Authentication:** Verifies Firebase ID Tokens received from the frontend using the Firebase Admin SDK.
* **Session Management (If using Passport):** Uses `express-session` with `connect-pg-simple` storing session data in the OCI Autonomous Database.
* **Database Interaction:** Uses Drizzle ORM with the `pg` driver to interact with the OCI Autonomous Database (PostgreSQL mode).
* **Secrets:** Fetches database credentials and session secrets from OCI Vault at runtime using Instance Principals authentication via the OCI SDK.

### 3.3. Database

* **Technology:** **OCI Autonomous Database (Always Free Tier)**, configured in **PostgreSQL compatibility mode**.
* **Why:** Provides a managed PostgreSQL experience within OCI's free tier, handling backups, patching, and basic scaling. Reduces management overhead compared to self-hosting on the VM. Supports standard SQL and PostGIS extension (check free tier limits) for future geolocation features.
* **Access:** Accessed only from the private OCI VM via its private IP address (configured via OCI Network Security Groups).

### 3.4. Authentication

* **Technology:** **Firebase Authentication**.
* **Why:** Managed, secure, easy-to-use SDKs for frontend integration, simple backend token verification, handles complex flows (password reset, email verification), generous free tier. Significantly reduces development effort and security risk compared to self-managed Passport.js for a first professional app.
* **Flow:** Frontend uses Firebase SDK for signup/login. On successful login, frontend gets a Firebase ID Token and sends it in the `Authorization: Bearer <token>` header with API requests to the backend. Backend verifies the token using Firebase Admin SDK.

### 3.5. Secrets Management

* **Technology:** **OCI Vault**.
* **Why:** Secure, managed secret storage within OCI. Integrates seamlessly with OCI Compute Instances via Instance Principals, eliminating the need to store OCI credentials on the VM itself.
* **Usage:** Stores Database credentials/connection string, Express session secret.

### 3.6. Entry Point / CDN / Security

* **Technology:** **Cloudflare**.
    * **DNS:** Manages the application's domain name.
    * **Cloudflare Pages:** Hosts and distributes the frontend globally (CDN).
    * **Cloudflare Tunnel:** Provides a secure, outbound-only connection from the private OCI VM to Cloudflare's edge, exposing the backend API without opening inbound firewall ports on OCI.
* **Why:** Provides performance (CDN), security (Tunnel, optional WAF/DDoS), and necessary connectivity for the private VM architecture. Aligns with user preference.

### 3.7. Infrastructure as Code

* **Technology:** **Terraform** with the OCI provider.
* **Why:** Enables reproducible, version-controlled infrastructure provisioning and management. Aligns with user preference and best practices.
* **Scope:** Manages OCI VCN, Subnets, Security Groups, Compute Instance, Autonomous Database, Vault, Secrets, OCIR, and related IAM policies/dynamic groups.

### 3.8. CI/CD

* **Technology:** **GitHub Actions**.
* **Why:** Integrates directly with the GitHub repository. Provides a robust free tier for automation. Can build code, run tests, build Docker images, push to OCIR, deploy to Cloudflare Pages, and execute deployment scripts on the OCI VM (via SSH).
* **Workflows:** Separate workflows for CI (lint, test), Frontend Deployment (build, deploy to CF Pages), and Backend Deployment (build Docker, push to OCIR, trigger VM update script via SSH).

### 3.9. VM Services

* **Process Manager:** **`pm2`**. Manages the Node.js backend process, ensuring it runs continuously and restarts on failure. Enables clustering for performance.
* **Reverse Proxy:** **`nginx`**. Runs on the VM, listens locally (e.g., port 80), receives traffic from `cloudflared`, proxies API requests to the Node.js app (port 8080), potentially serves static files (though CF Pages is preferred), handles WebSocket proxying, and adds security headers.

## 4. Data Flow (Typical API Request)

1.  User interacts with Frontend (React App on Cloudflare Pages).
2.  Frontend makes an API call (e.g., `/api/venues`) to the backend via its Cloudflare domain.
3.  Frontend attaches the Firebase Auth ID Token to the `Authorization: Bearer` header.
4.  Request goes through Cloudflare's network.
5.  Cloudflare Tunnel securely forwards the request to the `cloudflared` daemon running on the OCI VM.
6.  `cloudflared` forwards the request to `nginx` (e.g., on port 80).
7.  `nginx` reverse proxies the request to the Node.js/Express backend (e.g., on port 8080).
8.  Express middleware intercepts the request.
9.  Authentication middleware verifies the Firebase ID Token using the Firebase Admin SDK.
10. If valid, the request proceeds to the API route handler.
11. Route handler interacts with the OCI Autonomous Database (PostgreSQL mode) using Drizzle ORM (connection string fetched securely from OCI Vault via OCI SDK/Instance Principals).
12. Backend sends JSON response back through `nginx`, `cloudflared`, Cloudflare Tunnel, and Cloudflare CDN to the Frontend.
13. Frontend updates the UI.

## 5. Infrastructure Overview (OCI)

* **Region:** Chosen OCI Region (e.g., `us-ashburn-1`).
* **VCN:** Single VCN (`10.0.0.0/16`).
* **Subnets:** One private subnet (`10.0.1.0/24`) hosting the VM and Database.
* **Gateways:** Internet Gateway and NAT Gateway for outbound VM access.
* **Routing:** Route table for the private subnet directs outbound traffic via NAT Gateway.
* **Security:** Network Security Groups (NSGs) control traffic:
    * `vm-nsg`: Allows outbound HTTP/HTTPS, allows egress to `db-nsg` on port 5432. Allows ingress SSH *only* if using OCI Bastion or specific secure IPs (not public internet).
    * `db-nsg`: Allows ingress on port 5432 *only* from `vm-nsg`.
* **Compute:** One `VM.Standard.A1.Flex` instance in the private subnet.
* **Database:** One OCI Autonomous Database (PostgreSQL mode, Always Free) in the private subnet, associated with `db-nsg`.
* **Vault:** One OCI Vault with a Key, storing DB credentials and Session Secret.
* **OCIR:** One private container repository.
* **IAM:** Dedicated User/Group, Compartment, Policies for resource management, Dynamic Group and Policy for VM access to Vault.

## 6. Security Considerations

Refer to [**SECURITY_GUIDE.md**](./SECURITY_GUIDE.md) for a detailed breakdown. Key aspects include:
* Firebase Authentication for user identity.
* Backend API protection via ID Token verification.
* Secrets stored securely in OCI Vault, accessed via Instance Principals.
* Network isolation using private subnets and NSGs.
* Secure ingress via Cloudflare Tunnel (no open inbound ports on VM).
* `nginx` as a reverse proxy adding a layer of separation.
* Standard secure coding practices, dependency scanning.
EOF

generate_file "docs/SETUP_GUIDE.md" << 'EOF'
# VenueShift - Setup Guide

This guide details the steps required to set up your local development environment and provision the necessary cloud infrastructure using Terraform.

## 1. Prerequisites

* **Git:** [Install Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git).
* **Node.js:** Install Node.js v18 or later (includes npm). [nvm](https://github.com/nvm-sh/nvm) is recommended for managing Node versions.
* **Yarn (Optional):** If using Yarn instead of npm (`npm install -g yarn`).
* **Terraform:** Install Terraform CLI v1.x or later ([Install Terraform](https://developer.hashicorp.com/terraform/install)).
* **OCI Account:** An Oracle Cloud Infrastructure account (Free Tier sufficient for MVP).
* **Cloudflare Account:** A Cloudflare account (Free Tier sufficient). You need a domain managed by Cloudflare.
* **SSH Key Pair:** Generate an SSH key pair (`ssh-keygen -t rsa -b 4096`). You'll need the public key content.
* **Code Editor:** VS Code, WebStorm, etc.

## 2. Repository Setup

1.  **Clone:** Clone this repository to your local machine:
    ```bash
    git clone <your-repo-url>
    cd venue-app
    ```
2.  **Install Dependencies:** Install root and workspace dependencies:
    ```bash
    npm install # Or yarn install
    # If using workspaces, this might install all deps, or you might need:
    # cd packages/frontend && npm install
    # cd ../backend && npm install
    # cd ../..
    ```

## 3. OCI Credentials for Terraform

Terraform needs credentials to interact with your OCI account. Follow the official [OCI Terraform Provider Setup Guide](https://registry.terraform.io/providers/oracle/oci/latest/docs#authentication). The recommended method involves:

1.  **Create OCI API Key:**
    * Log in to the OCI Console.
    * Go to your User settings -> API Keys -> Add API Key.
    * Choose 'Generate API Key Pair'. Download the private key (`.pem`) and save it securely (e.g., `~/.oci/oci_api_key.pem`). Copy the Configuration File Preview content.
2.  **Create OCI Config File:**
    * Create the directory `~/.oci`.
    * Create the file `~/.oci/config`.
    * Paste the copied configuration content into the file.
    * Ensure the `key_file` path points correctly to your downloaded private key.
    * Note your `tenancy_ocid`, `user_ocid`, `fingerprint`, and `region`.

## 4. Terraform Infrastructure Provisioning

This step creates the cloud resources (VM, DB, Vault, Network, etc.) on OCI.

1.  **Navigate:** Change directory to the Terraform configuration folder:
    ```bash
    cd infra/oci
    ```
2.  **Configure Variables:**
    * Create a file named `terraform.tfvars`. **DO NOT COMMIT THIS FILE TO GIT.** Add it to your root `.gitignore`.
    * Populate `terraform.tfvars` with required values (replace placeholders):
        ```hcl
        # terraform.tfvars - DO NOT COMMIT
        tenancy_ocid      = "ocid1.tenancy.oc1..<your_tenancy_ocid>"
        compartment_ocid  = "ocid1.compartment.oc1..<your_compartment_ocid>" # Create compartment in OCI if needed
        oci_region        = "us-ashburn-1" # Your OCI region
        user_ocid         = "ocid1.user.oc1..<your_user_ocid>"
        ssh_public_key    = "<paste_content_of_your_id_rsa.pub_here>"
        db_admin_password = "<choose_a_strong_db_password>"
        session_secret_value = "<generate_a_strong_random_session_secret>"
        vm_image_ocid     = "ocid1.image.oc1.iad.<your_chosen_arm_image_ocid>" # Find in OCI Console for your region
        # Optional: Override defaults from variables.tf if needed
        # project_name_prefix = "my-venue-app"
        # db_name = "myvenues"
        ```
    * **Security:** Ensure `terraform.tfvars` is in your `.gitignore`.
3.  **Initialize Terraform:** Download the OCI provider plugin.
    ```bash
    terraform init
    ```
4.  **Plan:** Review the resources Terraform will create. Read the output carefully.
    ```bash
    terraform plan
    ```
5.  **Apply:** Create the infrastructure. Type `yes` when prompted. This may take 10-20 minutes, especially for the database.
    ```bash
    terraform apply
    ```
6.  **Outputs:** Note the outputs, especially `vm_private_ip`.

## 5. OCI Vault Secret Population

Terraform created the *secrets* in OCI Vault but used placeholder values or values from `terraform.tfvars`. For production, it's best practice to populate sensitive secrets *after* Terraform runs, using secure methods.

1.  **Log in:** Go to the OCI Console.
2.  **Navigate:** Identity & Security -> Vault -> Select your Vault (`venues-mvp-vault`).
3.  **Secrets:** Go to Secrets.
4.  **Update `DB_CONNECTION_STRING`:**
    * Find the secret named `DB_CONNECTION_STRING`.
    * Click 'Create Secret Version'.
    * Construct the correct PostgreSQL connection string using the database FQDN/IP, port, username, password, and database name from the Terraform outputs or your `.tfvars` file (e.g., `postgresql://dbadmin:<YOUR_DB_PASSWORD>@<db_endpoint_fqdn>:5432/venuesdb`).
    * Paste the connection string into the 'Secret Contents' field.
    * Click 'Create Secret Version'.
5.  **Update `SESSION_SECRET`:**
    * Find the secret named `SESSION_SECRET`.
    * Click 'Create Secret Version'.
    * Paste the strong, random session secret value you defined in `terraform.tfvars`.
    * Click 'Create Secret Version'.

## 6. OCI VM Initial Setup

Connect to the VM and run the setup script.

1.  **Connect via SSH:** Use the private key corresponding to the public key you provided to Terraform. You might need to use the OCI Bastion service or temporarily allow SSH via an NSG rule if you didn't set up Bastion. Use the `vm_private_ip` from Terraform outputs.
    ```bash
    # Example (adjust path to key and IP)
    ssh -i ~/.ssh/id_rsa opc@<vm_private_ip>
    ```
    *(Note: Default user is often `opc` for Oracle Linux, `ubuntu` for Ubuntu)*
2.  **Copy Setup Script:** Copy the setup script to the VM (or clone the repo onto the VM).
    ```bash
    # Example using scp from your local machine
    scp -i ~/.ssh/id_rsa ./scripts/setup_vm.sh opc@<vm_private_ip>:~/
    ```
3.  **Run Setup Script:** Execute the script on the VM.
    ```bash
    ssh opc@<vm_private_ip>
    chmod +x setup_vm.sh
    sudo ./setup_vm.sh
    exit
    ```
    This installs Node.js, nginx, pm2, cloudflared, etc.

## 7. Cloudflare Setup

1.  **Cloudflare Tunnel:**
    * Follow the script's output or Cloudflare documentation to log `cloudflared` into your Cloudflare account from the VM (`cloudflared login`).
    * Create the tunnel: `cloudflared tunnel create venues-backend-tunnel`. Note the tunnel ID and credential file path.
    * Create a DNS record (CNAME) in Cloudflare pointing your desired subdomain (e.g., `api.yourdomain.com`) to the tunnel URL (`<tunnel-id>.cfargotunnel.com`).
    * Create the `cloudflared` configuration file (`~/.cloudflared/config.yml` or `/etc/cloudflared/config.yml`) on the VM:
        ```yaml
        tunnel: <your-tunnel-id>
        credentials-file: /home/opc/.cloudflared/<your-tunnel-id>.json # Adjust path if needed
        ingress:
          # Route API traffic to nginx on port 80
          - hostname: api.yourdomain.com # Your public hostname
            service: http://localhost:80
          # Default rule MUST be last
          - service: http_status:404
        ```
    * Enable and start the `cloudflared` service: `sudo systemctl enable --now cloudflared`.
2.  **Cloudflare Pages:**
    * Connect your GitHub repository to Cloudflare Pages.
    * Configure the build settings (e.g., Framework: Vite, Build command: `cd packages/frontend && npm run build`, Output directory: `packages/frontend/dist`).
    * Deploy the site. Assign your main domain or a subdomain (e.g., `app.yourdomain.com`) to the Pages deployment.

## 8. Initial Application Run & Test

1.  **Deploy Backend (Manual):**
    * SSH into the VM.
    * Clone your application repository (or copy the backend code).
    * Navigate to `/packages/backend`.
    * Install production dependencies: `npm install --production`.
    * Build TypeScript: `npm run build`.
    * Start with `pm2`: `pm2 start dist/server/index.js --name venues-backend`.
    * Save `pm2` process list: `pm2 save`.
2.  **Test Tunnel:** Access `https://api.yourdomain.com/health` (or a simple test endpoint) in your browser. You should get a response from your backend service via nginx.
3.  **Test Frontend:** Access your Cloudflare Pages URL (`https://app.yourdomain.com`). The basic UI shell should load.

Setup is now complete. Proceed with feature development as outlined in [**DEVELOPMENT_WORKFLOW.md**](./DEVELOPMENT_WORKFLOW.md).
EOF

generate_file "docs/DEVELOPMENT_WORKFLOW.md" << 'EOF'
# VenueShift - Development Workflow

This document outlines the layered approach for developing the VenueShift MVP features after the initial infrastructure setup (see [SETUP_GUIDE.md](./SETUP_GUIDE.md)) is complete.

## Overview

We follow a layered approach, building core functionality first and adding features incrementally. Each layer assumes the previous layers are complete and functional. Deployment happens frequently, ideally automated via CI/CD.

**Development Environment:** Code editing is done locally or via a cloud IDE. Testing and running the backend application occurs **on the OCI VM** accessed via SSH. Frontend development can be done locally using Vite's dev server, proxying API calls to the Cloudflare Tunnel URL.

## Layer 0: Foundation & Infrastructure Setup (Completed via SETUP_GUIDE.md)

* **Status:** OCI Infrastructure provisioned via Terraform, VM configured, Cloudflare Tunnel & Pages setup, basic CI running.
* **Outcome:** A running (empty) backend service accessible via Cloudflare Tunnel, and a deployment target for the frontend on Cloudflare Pages.

## Layer 1: Authentication & UI Shell

* **Goal:** Implement user signup, login, and logout using Firebase Authentication. Serve a basic frontend shell from Cloudflare Pages.
* **Backend Activities (`packages/backend` on VM):**
    * Install `firebase-admin` SDK.
    * Configure Firebase Admin SDK initialization (ideally using service account credentials stored securely, or relying on default credentials if running in a GCP environment - *less applicable here, explicit config needed*).
    * Implement middleware to verify Firebase ID Tokens passed in `Authorization: Bearer` header from the frontend.
    * *(Optional: If needing user data beyond Firebase Auth)* Create basic `/users` table in OCI ADB and endpoint to store/retrieve minimal user info upon first login after verifying token.
* **Frontend Activities (`packages/frontend` locally):**
    * Install Firebase Client SDK (`firebase`).
    * Configure Firebase client connection (using API keys etc. from environment variables - **DO NOT COMMIT KEYS**).
    * Build Login/Signup UI components (Shadcn UI).
    * Integrate Firebase Auth UI flow (`signInWithEmailAndPassword`, `createUserWithEmailAndPassword`, `signOut`, `onAuthStateChanged`).
    * Implement logic to get ID token (`currentUser.getIdToken()`) and send with API requests.
    * Implement Dark Mode toggle.
    * Set up basic routing (`wouter`).
* **Deployment:**
    * Backend: Copy code to VM, `npm install`, `npm run build`, `pm2 restart venues-backend`.
    * Frontend: `npm run build`, deploy `dist` folder to Cloudflare Pages (via Git push trigger or manual upload).
* **Outcome:** Users can register, log in, and log out. A basic UI is served. Backend API calls require a valid Firebase ID Token.

## Layer 2: Core Backend API & Database Integration

* **Goal:** Enable logged-in users to interact with a secure backend API for basic profile data stored in OCI Autonomous Database (PG mode).
* **Backend Activities (`packages/backend` on VM):**
    * Define/refine Drizzle schema for `users` (profile fields).
    * Implement DB connection using `pg` driver and connection string from OCI Vault (via env var).
    * Create protected API endpoint `/api/users/me` (uses Firebase token middleware) to get/update user profile data linked to the Firebase UID.
* **Database Activities (OCI ADB via VM):**
    * Run Drizzle migrations (`npm run db:push`) from the VM to update the schema.
* **Frontend Activities (`packages/frontend` locally):**
    * Build UI for displaying/editing user profile.
    * Implement authenticated API calls to `/api/users/me` (sending Firebase ID Token).
* **Deployment:** Deploy backend updates to VM, frontend updates to Cloudflare Pages.
* **Outcome:** Logged-in users can view and potentially update basic profile information stored in the application's database.

## Layer 3: Core Feature Implementation (Venues)

* **Goal:** Implement the main Venue CRUD (Create, Read, Update, Delete) functionality.
* **Backend Activities (`packages/backend` on VM):**
    * Define Drizzle schema for `venues` table (linking to a user/owner).
    * Create protected API endpoints for `/api/venues` (GET list, GET by ID, POST create, PUT update, DELETE).
    * **Implement Authorization:** Ensure only authenticated users can create venues. Ensure only the *owner* (check `venues.owner_id == req.user.uid` from verified token) can update or delete a specific venue.
    * Implement input validation (using Zod or similar).
* **Database Activities (OCI ADB via VM):**
    * Run Drizzle migrations (`npm run db:push`).
* **Frontend Activities (`packages/frontend` locally):**
    * Build UI components/pages for listing, viewing, creating, editing venues.
    * Integrate authenticated API calls to `/api/venues`.
* **Deployment:** Deploy backend updates to VM, frontend updates to Cloudflare Pages.
* **Outcome:** Users can manage venues through the application interface.

## Layer 4: Real-time Features (WebSockets)

* **Goal:** Add real-time capabilities (e.g., notifications).
* **Backend Activities (`packages/backend` on VM):**
    * Install `ws` library.
    * Integrate WebSocket server with the Express app (handle `upgrade` requests).
    * **Implement WebSocket Authentication:** Verify Firebase ID Token during the WebSocket handshake process (e.g., passed as a query parameter or subprotocol). Only allow authenticated connections.
    * Implement logic for managing connections and broadcasting messages.
* **`nginx` Configuration (on VM):**
    * Update nginx config to correctly proxy WebSocket connections (handle `Upgrade` and `Connection` headers).
* **Frontend Activities (`packages/frontend` locally):**
    * Implement WebSocket client logic (connect, authenticate, send/receive).
    * Integrate real-time updates into the UI.
* **Deployment:** Deploy backend updates (including nginx config changes) to VM, frontend updates to Cloudflare Pages.
* **Outcome:** Application supports real-time features.

## Layer 5: Production Readiness & Enhancements

* **Goal:** Harden the application, fully automate deployments, implement monitoring/logging, and optimize performance.
* **Activities:**
    * **CI/CD:** Mature GitHub Actions pipeline: add testing stages, automated backend deployment script execution via SSH, automated frontend deployment to CF Pages.
    * **Monitoring:** Configure OCI Monitoring agents/alerts for VM & DB. Implement structured logging in Node.js (e.g., Winston) writing to files managed by `pm2`. Consider log shipping to OCI Logging Analytics or a third-party service.
    * **Error Reporting:** Integrate Sentry or similar client/server-side.
    * **Database:** Configure OCI Autonomous Database automatic backups. Review query performance and add indexes as needed.
    * **Security Hardening:** Review and tighten OCI NSG rules. Implement robust security headers in `nginx`. Review CSRF protection. Implement rate limiting (e.g., in `nginx` or using `express-rate-limit`). Review input validation. Consider Firebase App Check.
    * **Optimization:** Configure `nginx` caching. Tune Node.js performance (`pm2` cluster mode). Analyze OCI VM/DB resource usage and scale *if necessary* (may require moving off Always Free).
    * **Custom Domain:** Ensure Cloudflare DNS and Pages are correctly configured.
* **Documentation:** Finalize all user and technical documentation.
* **Outcome:** A production-ready, monitored, secure, and reasonably performant application.
EOF

generate_file "docs/DEPLOYMENT_GUIDE.md" << 'EOF'
# VenueShift - Deployment Guide

This guide describes the deployment process for the VenueShift application components.

## Overview

The application consists of two main deployable units:

1.  **Frontend:** A static React/Vite application hosted on **Cloudflare Pages**.
2.  **Backend:** A Node.js/Express/TypeScript API running on an **OCI Compute VM**, managed by `pm2` and proxied by `nginx`.

Deployments are automated via **GitHub Actions**.

## 1. Frontend Deployment (Cloudflare Pages)

* **Trigger:** Merges to the `main` branch (or pushes to a specific deployment branch).
* **Process (`.github/workflows/deploy.yml` - Frontend Job):**
    1.  Checkout code.
    2.  Set up Node.js environment.
    3.  Install frontend dependencies (`cd packages/frontend && npm install`).
    4.  Inject build-time environment variables (e.g., `VITE_FIREBASE_API_KEY`, `VITE_API_BASE_URL` pointing to your Cloudflare Tunnel domain `https://api.yourdomain.com`) using GitHub Secrets.
    5.  Build the static frontend application (`npm run build`).
    6.  Deploy the build output directory (`packages/frontend/dist`) to Cloudflare Pages using the Cloudflare Wrangler GitHub Action or CLI.

## 2. Backend Deployment (OCI VM)

* **Trigger:** Merges to the `main` branch (or pushes to a specific deployment branch), typically after the frontend deployment job succeeds.
* **Process (`.github/workflows/deploy.yml` - Backend Job):**
    1.  Checkout code.
    2.  Set up Node.js environment.
    3.  Build the Docker image using the root `Dockerfile`.
        * The Dockerfile copies necessary code (`packages/backend`, `package.json`, etc.), installs *production* dependencies, builds TypeScript (`npm run build` inside `packages/backend`), exposes port 8080, and sets the `CMD` to run the built JS entry point.
    4.  Log in to OCI Container Registry (OCIR) using credentials stored as GitHub Secrets.
    5.  Tag the Docker image (e.g., with the Git commit SHA and `latest`).
    6.  Push the tagged image to your OCIR repository (e.g., `iad.ocir.io/<your-tenancy>/venues-mvp-backend-repo/venues-backend:latest`).
    7.  **Trigger VM Update (via SSH):**
        * Use an SSH action (like `appleboy/ssh-action`) configured with the VM's private IP and SSH private key (stored as a GitHub Secret).
        * The SSH action executes commands on the VM:
            * `docker login <region-code>.ocir.io -u <tenancy>/<user> -p <oci_auth_token>` (Credentials from secrets)
            * `docker pull <ocir_image_url>:latest` (Pull the newly pushed image)
            * `pm2 stop venues-backend` (Stop the current process)
            * *(Optional)* Prune old Docker images (`docker image prune -f`).
            * `pm2 delete venues-backend` (Remove old process definition).
            * `pm2 start <path_to_your_built_index.js> --name venues-backend -- --docker-image <ocir_image_url>:latest` (Start the app using the new image path or directly if not containerizing on VM - *Adjust start command based on whether you run the Node app directly or inside Docker on the VM*). **Running directly via Node/PM2 is simpler for this setup.**
            * `pm2 save` (Save the process list for reboot).
            * *(Alternative)* If not using Docker on the VM: Use `rsync` or `scp` via SSH action to copy built backend files (`packages/backend/dist`, `node_modules`, `package.json`) to the VM, then run `pm2 restart venues-backend`.

## 3. Environment Variables

* **Frontend (Cloudflare Pages):** Configure environment variables (like `VITE_FIREBASE_API_KEY`) directly in the Cloudflare Pages project settings. These are injected during the build process.
* **Backend (OCI VM):**
    * Environment variables (like `DATABASE_URL`, `SESSION_SECRET`, `FIREBASE_ADMIN_SDK_CONFIG`) are **not** stored in code.
    * They should be securely fetched from **OCI Vault** by the Node.js application at startup using the OCI SDK and the VM's Instance Principal authentication.
    * Alternatively (less secure), set them in the VM's environment (e.g., in `/etc/environment` or via `pm2` ecosystem file) during the initial VM setup (`setup_vm.sh`) or via secure CI/CD mechanisms. Fetching from Vault is the recommended best practice.

## 4. Database Migrations

* Database migrations (using Drizzle Kit) must be run against the OCI Autonomous Database.
* **Process:**
    1.  Generate migration files locally (`npm run db:generate` in `packages/backend`).
    2.  Commit migration files to Git.
    3.  During the backend deployment workflow (or as a separate manual/scripted step):
        * SSH into the OCI VM.
        * Navigate to the deployed backend code directory.
        * Ensure database credentials are available as environment variables (sourced from Vault).
        * Run the migration: `npm run db:push`.
EOF

generate_file "docs/SECURITY_GUIDE.md" << 'EOF'
# VenueShift - Security Guide

Security is a critical aspect of the VenueShift application. This guide outlines key security considerations and practices implemented.

## 1. Core Principles

* **Least Privilege:** Grant only necessary permissions to users, services, and infrastructure components (OCI IAM Policies, NSGs).
* **Defense-in-Depth:** Implement security controls at multiple layers (network, infrastructure, application).
* **Secure Defaults:** Configure services securely from the start.
* **Secrets Management:** Never hardcode secrets; use a dedicated service (OCI Vault).
* **Regular Patching:** Keep OS, dependencies, and Node.js updated (handled via VM setup/maintenance).

## 2. Authentication

* **Provider:** Firebase Authentication is used for user identity management.
* **Benefits:** Handles password hashing, storage, email verification, password reset flows securely. Reduces attack surface compared to self-managed authentication.
* **Backend Verification:** The backend API **MUST** verify the Firebase ID Token sent in the `Authorization: Bearer` header for *all* protected endpoints using the Firebase Admin SDK (`verifyIdToken`). This ensures requests originate from authenticated users.

## 3. Authorization

* **Concept:** Determining *what* an authenticated user is allowed to do.
* **Implementation:** Implemented within the backend API route handlers.
    * **Example:** Before allowing an update or delete operation on a venue (`PUT/DELETE /api/venues/:id`), the backend code must check if the authenticated user's UID (obtained from the verified Firebase ID Token) matches the `owner_id` associated with that venue in the database.
* **RBAC (Future):** Role-Based Access Control can be added later by assigning roles to users (e.g., 'admin', 'manager', 'user') and checking these roles in middleware or route handlers.

## 4. Secrets Management

* **Service:** OCI Vault is used to store all sensitive configuration data:
    * Database Credentials / Connection String
    * Express Session Secret
    * Firebase Admin SDK Credentials (if using service account file)
    * Any third-party API keys.
* **Access from VM:** The Node.js application running on the OCI VM uses the **OCI SDK** and **Instance Principals** authentication. This allows the VM to securely request secrets from the Vault without needing OCI API keys stored on the VM itself. An IAM policy grants the VM's Dynamic Group permission to read secrets from the specific Vault.
* **Access in CI/CD:** GitHub Actions workflows access secrets (OCI credentials, SSH keys) stored securely as **GitHub Encrypted Secrets**.

## 5. Network Security

* **OCI VCN:** Provides network isolation.
* **Private Subnet:** The VM and Database reside in a private subnet, not directly accessible from the public internet.
* **Network Security Groups (NSGs):** Act as stateful firewalls:
    * VM NSG allows necessary outbound traffic (HTTPS, DNS) and egress to the DB NSG on the database port. Ingress is highly restricted (SSH only via Bastion/secure IPs if needed).
    * DB NSG allows ingress *only* from the VM NSG on the database port.
* **Cloudflare Tunnel:** Creates a secure, outbound-only connection from the private VM to Cloudflare. All public ingress traffic to the backend API goes through Cloudflare's edge and the secure tunnel, avoiding open inbound ports on the OCI firewall.
* **Cloudflare Security:** Provides DDoS mitigation and optional WAF (Web Application Firewall) capabilities at the edge.

## 6. VM Hardening & Management

* **OS Updates:** The `setup_vm.sh` script should include commands to update the OS packages. Regular patching is crucial. Consider automating this (e.g., OCI OS Management Service).
* **User Separation:** Run the Node.js application as a non-root user.
* **`nginx`:** Acts as a reverse proxy, providing an additional layer of separation and allowing for configuration of security headers, rate limiting, and request filtering.
* **`pm2`:** Ensures the Node.js process is restarted automatically if it crashes.

## 7. Application Security

* **Input Validation:** All data coming from the frontend (API request bodies, query parameters) must be validated on the backend (e.g., using Zod, express-validator) to prevent injection attacks and ensure data integrity.
* **Password Hashing:** Handled securely by Firebase Authentication.
* **Session Security:** If using `express-session`, configure secure cookies (`httpOnly: true`, `secure: true` - requires HTTPS), use a strong secret stored in Vault, and set appropriate expiration.
* **CSRF Protection:** Implement CSRF tokens (e.g., using `csurf` middleware in Express) for all state-changing requests (POST, PUT, DELETE) if using cookie-based sessions (less critical if relying solely on Bearer tokens, but good practice).
* **Dependency Scanning:** Use `npm audit` or tools like Snyk/Dependabot (via GitHub) to identify and fix vulnerabilities in dependencies.
* **Rate Limiting:** Implement on sensitive endpoints (e.g., login) using `nginx` or `express-rate-limit`.
* **Security Headers:** Configure in `nginx` or via middleware (e.g., `helmet` for Express):
    * `Content-Security-Policy`
    * `Strict-Transport-Security` (HSTS)
    * `X-Content-Type-Options`
    * `X-Frame-Options`
    * `Referrer-Policy`

## 8. Logging and Monitoring

* **Audit Trails:** Log key security events (logins, failed logins, permission changes, critical actions).
* **Monitoring:** Use OCI Monitoring and Cloudflare Analytics to watch for anomalies, resource exhaustion, and potential attacks. Set up alerts for high error rates or unusual traffic patterns.
* **Log Security:** Protect log files on the VM. Consider centralized, secure log aggregation (e.g., OCI Logging Analytics).

## 9. Future Hardening Steps (Layer 5+)

* **Firebase App Check:** Verify requests originate from your legitimate frontend application.
* **Cloudflare WAF:** Implement advanced Web Application Firewall rules.
* **Regular Security Audits:** Conduct periodic manual or automated security reviews.
EOF

echo "-------------------------------------"
echo "Generating script files..."

generate_file "scripts/setup_vm.sh" << 'EOF'
#!/bin/bash

# setup_vm.sh
# Initial setup script for OCI Compute VM (ARM - Oracle Linux / Ubuntu)
# Run this script with sudo: sudo ./setup_vm.sh

echo "Starting VM Setup Script..."

# --- Update System ---
echo "Updating system packages..."
if command -v apt-get &> /dev/null; then
    sudo apt-get update && sudo apt-get upgrade -y
elif command -v yum &> /dev/null; then
    sudo yum update -y
else
    echo "Unsupported package manager. Exiting."
    exit 1
fi
echo "System packages updated."

# --- Install Base Dependencies ---
echo "Installing base dependencies (git, curl, nginx, postgresql-client)..."
if command -v apt-get &> /dev/null; then
    sudo apt-get install -y git nginx curl gnupg postgresql-client unzip # Added unzip for potential future use
elif command -v yum &> /dev/null; then
    sudo yum install -y git nginx curl postgresql unzip # Check exact package name for pg client on Oracle Linux
else
    echo "Unsupported package manager. Exiting."
    exit 1
fi
echo "Base dependencies installed."

# --- Install NVM & Node.js (LTS) ---
# Run NVM installation as the non-root user who will run the app (e.g., opc, ubuntu)
# Determine the primary non-root user (common default users)
PRIMARY_USER=""
if id "opc" &>/dev/null; then
    PRIMARY_USER="opc"
elif id "ubuntu" &>/dev/null; then
    PRIMARY_USER="ubuntu"
else
    echo "Could not determine primary non-root user (opc or ubuntu). NVM setup might need manual adjustment."
    # Attempt to find the sudo user if possible
    if [ -n "$SUDO_USER" ]; then
        PRIMARY_USER=$SUDO_USER
        echo "Using SUDO_USER: $PRIMARY_USER"
    else
         echo "Exiting NVM setup."
         # Decide if you want to exit the whole script or just skip NVM
         # exit 1
         PRIMARY_USER="root" # Fallback, but not recommended
    fi
fi

if [ "$PRIMARY_USER" != "root" ]; then
    echo "Installing NVM and Node.js for user: $PRIMARY_USER..."
    sudo -u $PRIMARY_USER bash -c 'curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash'

    # Source NVM in the script's environment temporarily to install Node
    export NVM_DIR="/home/$PRIMARY_USER/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

    # Install Node LTS and set as default
    sudo -u $PRIMARY_USER bash -c "source $NVM_DIR/nvm.sh && nvm install --lts && nvm alias default node"
    echo "NVM and Node.js LTS installed for user $PRIMARY_USER."

    # --- Install PM2 Globally ---
    echo "Installing PM2 globally..."
    # Run npm install as the primary user
    sudo -u $PRIMARY_USER bash -c "source $NVM_DIR/nvm.sh && npm install pm2 -g"

    # --- Setup PM2 Startup Script ---
    echo "Setting up PM2 startup service..."
    # Generate startup script command for the primary user
    PM2_STARTUP_CMD=$(sudo -u $PRIMARY_USER bash -c "source $NVM_DIR/nvm.sh && pm2 startup systemd -u $PRIMARY_USER --hp /home/$PRIMARY_USER")
    # Extract the command part (sudo env ...)
    PM2_EXEC_CMD=$(echo "$PM2_STARTUP_CMD" | grep '^sudo')
    # Execute the command to set up the service
    eval "$PM2_EXEC_CMD"
    echo "PM2 startup service configured."

else
    echo "Skipping NVM/Node/PM2 setup for root user. Please run as sudo from a non-root user account."
fi


# --- Install Cloudflared ---
echo "Installing Cloudflared..."
# Check architecture
ARCH=$(uname -m)
CLOUDFLARED_URL=""

if [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
  CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64"
elif [ "$ARCH" = "x86_64" ]; then
  CLOUDFLARED_URL="https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64"
else
  echo "Unsupported architecture: $ARCH for Cloudflared automatic download."
  # Optionally add manual instructions here
fi

if [ -n "$CLOUDFLARED_URL" ]; then
  wget -q $CLOUDFLARED_URL -O /usr/local/bin/cloudflared
  chmod +x /usr/local/bin/cloudflared
  # Verify installation
  cloudflared --version
  echo "Cloudflared installed."
  # Note: Service setup (config.yml, service install) is done manually or via later steps
  # as it requires tunnel creation and credentials.
else
    echo "Could not automatically install Cloudflared."
fi


# --- Configure Nginx (Basic Placeholder) ---
echo "Configuring basic Nginx reverse proxy..."
NGINX_CONF="/etc/nginx/sites-available/default"
# Backup existing config
sudo cp $NGINX_CONF "${NGINX_CONF}.bak"
# Create basic reverse proxy config
sudo bash -c "cat > $NGINX_CONF" << EOL
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    server_name _; # Listen on all hostnames

    location / {
        # Proxy requests to the Node.js app (assuming it runs on 8080)
        proxy_pass http://localhost:8080;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade'; # Required for WebSockets
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Add security headers later (in Layer 5)
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    # add_header X-Content-Type-Options "nosniff" always;
    # add_header X-Frame-Options "SAMEORIGIN" always;
    # add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Optional: Add specific location blocks if needed, e.g., for serving static files directly
    # location /static/ {
    #     alias /path/to/your/static/files/;
    # }
}
EOL

# Test and restart Nginx
sudo nginx -t
if [ $? -eq 0 ]; then
    sudo systemctl restart nginx
    sudo systemctl enable nginx # Ensure it starts on boot
    echo "Nginx configured and restarted."
else
    echo "Nginx configuration test failed. Please check $NGINX_CONF manually."
    sudo cp "${NGINX_CONF}.bak" $NGINX_CONF # Restore backup
fi

# --- Create Application Directory & User (Optional but Recommended) ---
# echo "Creating application user and directory..."
# APP_USER="appuser"
# APP_GROUP="appgroup"
# APP_DIR="/opt/app"

# sudo groupadd $APP_GROUP || echo "Group $APP_GROUP already exists."
# sudo useradd -s /bin/false -g $APP_GROUP -d $APP_DIR $APP_USER || echo "User $APP_USER already exists."
# sudo mkdir -p $APP_DIR
# sudo chown -R $APP_USER:$APP_GROUP $APP_DIR
# echo "Application user and directory created."

# --- Firewall (Optional - Depends on OS/Setup) ---
# If using firewalld or ufw, ensure port 80 is open for nginx (though Tunnel bypasses this need for external access)
# Example ufw: sudo ufw allow 'Nginx HTTP'

echo "VM Setup Script Completed."
echo "Manual steps remaining:"
echo "1. Log in cloudflared ('cloudflared login')"
echo "2. Create cloudflared tunnel ('cloudflared tunnel create <name>')"
echo "3. Configure cloudflared config.yml with tunnel ID and ingress rules."
echo "4. Install cloudflared service ('sudo cloudflared service install')"
echo "5. Clone application code, install dependencies, build, and start with PM2."
echo "6. Set up Cloudflare DNS CNAME record for the tunnel."
EOF

# --- Add Placeholders for Package Code ---
# Create empty placeholder files to indicate where code goes
echo "-------------------------------------"
echo "Touching placeholder package files..."
touch packages/backend/src/index.ts
touch packages/backend/package.json
touch packages/frontend/src/main.tsx
touch packages/frontend/package.json
touch packages/frontend/vite.config.ts

# --- Add Placeholders for GitHub Actions ---
echo "Touching placeholder GitHub Actions files..."
touch .github/workflows/ci.yml
touch .github/workflows/deploy.yml


echo "-------------------------------------"
echo "Project structure generation script finished."
echo "Remember to:"
echo "1. Add your actual application code to packages/backend and packages/frontend."
echo "2. Create infra/oci/terraform.tfvars with your OCI credentials and settings (and add it to .gitignore)."
echo "3. Customize the Dockerfile if needed."
echo "4. Define your GitHub Actions workflows in .github/workflows/."
echo "-------------------------------------"

