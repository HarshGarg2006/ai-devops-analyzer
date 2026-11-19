\# AI-Based DevOps Log Analyzer (LogAI)



An intelligent log analysis platform designed to help developers identify application errors, understand possible root causes, and troubleshoot issues more efficiently.



\## Project Overview



AI-Based DevOps Log Analyzer (LogAI) is a web-based application that simplifies the process of monitoring and analyzing application logs. It helps developers identify errors, classify log issues, and get suggestions for resolving problems.



The project provides a web dashboard with secure authentication and a backend API connected to a PostgreSQL database. The application is containerized using Docker Compose and deployed on AWS EC2.



\## Key Features



\- \*\*Log Analysis:\*\* Analyze application logs to identify errors and issues.

\- \*\*Error Classification:\*\* Organize detected issues into meaningful categories.

\- \*\*Root Cause Suggestions:\*\* Provide possible explanations and troubleshooting suggestions.

\- \*\*Dashboard:\*\* Access project features through a web-based interface.

\- \*\*User Authentication:\*\* Secure login using JWT-based authentication.

\- \*\*Database Integration:\*\* Store application data using PostgreSQL.

\- \*\*Containerization:\*\* Run frontend, backend, and database services using Docker Compose.

\- \*\*Cloud Deployment:\*\* Host the application on AWS EC2.



\## Technology Stack



| Component | Technology |

|---|---|

| Frontend | React.js, Vite |

| Backend | Python, FastAPI |

| Database | PostgreSQL |

| Containerization | Docker |

| Container Management | Docker Compose |

| Cloud Platform | AWS EC2 |

| Authentication | JWT |

| Version Control | Git and GitHub |



\## Project Architecture



The application follows a three-tier architecture:



1\. \*\*Frontend:\*\* React and Vite provide the user interface.

2\. \*\*Backend:\*\* FastAPI handles API requests, authentication, and log analysis operations.

3\. \*\*Database:\*\* PostgreSQL stores application data.



Docker Compose manages the application services, which are deployed on an AWS EC2 Ubuntu instance.



\### Architecture Flow



```text

&#x20;      User / Browser

&#x20;             |

&#x20;             v

&#x20;     React + Vite

&#x20;        Frontend

&#x20;             |

&#x20;             v

&#x20;      FastAPI Backend

&#x20;             |

&#x20;             v

&#x20;       PostgreSQL

&#x20;         Database



&#x20;   Docker Compose

&#x20;   (Service Management)

&#x20;             |

&#x20;             v

&#x20;         AWS EC2

&#x20;      Cloud Hosting

```



\## Project Structure



```text

ai-devops-analyzer/

│

├── frontend/

│   └── React Application Files

│

├── backend/

│   └── FastAPI Application Files

│

├── docker-compose.yml

├── README.md

└── Other Configuration Files

```



\*Note: This is a simplified overview of the project structure.\*



\## Installation and Setup



\### Prerequisites



\- Python

\- Node.js and npm

\- Docker Desktop or Docker Engine

\- Git



\### 1. Clone the Repository



```bash

git clone https://github.com/HarshGarg2006/ai-devops-analyzer.git

```



\### 2. Open the Project Directory



```bash

cd ai-devops-analyzer

```



\### 3. Configure Environment Variables



Create the required environment configuration files using the project's existing configuration and provide your own database credentials and JWT settings.



Do not upload passwords, API keys, or other secrets to GitHub.



\### 4. Run Using Docker Compose



```bash

docker compose up -d --build

```



\### 5. Check Running Containers



```bash

docker ps

```



\### 6. Stop the Application



```bash

docker compose down

```



\## Deployment



The application is deployed on an AWS EC2 Ubuntu instance.



\- Frontend is accessible through the web browser.

\- FastAPI backend provides REST API services.

\- PostgreSQL provides database functionality.

\- Docker Compose manages the application containers.



\## Live Application



\*\*Website:\*\* http://13.233.139.10



\*\*Backend API Documentation (Swagger):\*\* http://13.233.139.10:8000/docs



\## GitHub Repository



https://github.com/HarshGarg2006/ai-devops-analyzer



\## Future Enhancements



\- Automated CI/CD pipeline using GitHub Actions or Jenkins.

\- Advanced AI/ML-based log analysis.

\- Real-time log monitoring and alert notifications.

\- Integration with Elasticsearch and Grafana.

\- Kubernetes-based container orchestration.

\- Improved cloud monitoring and scalability.



\## Author



\*\*Harsh Garg\*\*  

B.Tech – Computer Science and Engineering (Data Science)



\## Conclusion



AI-Based DevOps Log Analyzer aims to reduce manual log analysis efforts by helping developers detect application errors, understand possible causes, and troubleshoot issues efficiently. The project demonstrates the integration of modern web technologies, backend APIs, containerization, database management, and cloud deployment.

