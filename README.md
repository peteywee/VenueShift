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
