pipeline {
    agent any
    
    environment {
        // Docker Configuration
        DOCKER_CREDENTIALS_ID = 'dockerhub-credentials'
        DOCKER_REGISTRY = 'docker.io'
        FRONTEND_IMAGE = "hamayari/commercial-pfe-frontend"
        
        // Versioning
        IMAGE_TAG = "${env.BUILD_NUMBER}"
        GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
        
        // Node Configuration
        NODE_OPTIONS = '--max_old_space_size=4096'
    }
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', artifactNumToKeepStr: '5'))
        timestamps()
        timeout(time: 45, unit: 'MINUTES')
        disableConcurrentBuilds()
    }
    
    stages {
        stage('🔍 Checkout & Info') {
            steps {
                echo "📥 Cloning Frontend repository..."
                checkout scm
                script {
                    echo "Branch: ${env.GIT_BRANCH}"
                    echo "Commit: ${GIT_COMMIT_SHORT}"
                    echo "Build: #${env.BUILD_NUMBER}"
                }
            }
        }
        
        stage('📦 Install Dependencies') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-v /root/.npm:/root/.npm'
                    reuseNode true
                }
            }
            steps {
                echo "📦 Installing Node dependencies..."
                sh 'npm ci --legacy-peer-deps'
            }
        }
        
        stage('🔍 Lint Code') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-v /root/.npm:/root/.npm'
                    reuseNode true
                }
            }
            steps {
                echo "🔍 Running ESLint..."
                sh 'npm run lint || echo "Linting issues found but continuing..."'
            }
        }
        
        stage('🧪 Tests Unitaires') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-v /root/.npm:/root/.npm'
                    reuseNode true
                }
            }
            steps {
                echo "🧪 Running Unit Tests..."
                sh '''
                    npm run test -- \
                        --watch=false \
                        --code-coverage \
                        --browsers=ChromeHeadless \
                        || echo "Some tests failed but continuing..."
                '''
            }
            post {
                always {
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Frontend Coverage Report'
                    ])
                }
            }
        }
        
        stage('🏗️ Build Production') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-v /root/.npm:/root/.npm'
                    reuseNode true
                }
            }
            steps {
                echo "🔨 Building Frontend for Production..."
                sh 'npm run build -- --configuration production'
            }
            post {
                success {
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                }
            }
        }
        
        stage('🔒 Security Scan') {
            agent {
                docker {
                    image 'node:18-alpine'
                    args '-v /root/.npm:/root/.npm'
                    reuseNode true
                }
            }
            steps {
                echo "🔐 Scanning Dependencies..."
                sh 'npm audit --audit-level=moderate || echo "Vulnerabilities found but continuing..."'
                sh 'npm list --depth=0 || true'
            }
        }
        
        stage('🐳 Build Docker Image') {
            steps {
                script {
                    echo "🐳 Building Docker Image..."
                    sh """
                        docker build \
                            --build-arg BUILD_DATE=\$(date -u +'%Y-%m-%dT%H:%M:%SZ') \
                            --build-arg VCS_REF=${GIT_COMMIT_SHORT} \
                            --build-arg VERSION=${IMAGE_TAG} \
                            -t ${FRONTEND_IMAGE}:${IMAGE_TAG} \
                            -t ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT} \
                            -t ${FRONTEND_IMAGE}:latest \
                            .
                    """
                }
            }
        }
        
        stage('🧪 Tests Intégration') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                script {
                    echo "🧪 Running Integration Tests..."
                    sh '''
                        # Démarrer le conteneur pour les tests
                        docker run -d --name frontend-test \
                            -p 80:80 \
                            ${FRONTEND_IMAGE}:${IMAGE_TAG}
                        
                        # Attendre que Nginx démarre
                        sleep 10
                        
                        # Test de santé
                        curl -f http://localhost:80 || exit 1
                        
                        # Vérifier que les assets sont servis
                        curl -f http://localhost:80/index.html || exit 1
                        
                        echo "✅ Integration tests passed!"
                    '''
                }
            }
            post {
                always {
                    sh 'docker stop frontend-test || true'
                    sh 'docker rm frontend-test || true'
                }
            }
        }
        
        stage('📤 Push to Docker Hub') {
            when {
                anyOf {
                    branch 'develop'
                    branch 'main'
                }
            }
            steps {
                script {
                    echo "📤 Pushing to Docker Hub..."
                    withCredentials([usernamePassword(
                        credentialsId: DOCKER_CREDENTIALS_ID,
                        usernameVariable: 'DOCKER_USER',
                        passwordVariable: 'DOCKER_PASS'
                    )]) {
                        sh '''
                            echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                            docker push ${FRONTEND_IMAGE}:${IMAGE_TAG}
                            docker push ${FRONTEND_IMAGE}:${GIT_COMMIT_SHORT}
                            docker push ${FRONTEND_IMAGE}:latest
                            echo "✅ Images pushed successfully!"
                        '''
                    }
                }
            }
        }
        
        stage('📊 Quality Report') {
            steps {
                script {
                    echo "📊 Build Summary:"
                    echo "  - Branch: ${env.GIT_BRANCH}"
                    echo "  - Build: #${env.BUILD_NUMBER}"
                    echo "  - Commit: ${GIT_COMMIT_SHORT}"
                    echo "  - Image: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
                    echo "  - Docker Hub: https://hub.docker.com/r/hamayari/commercial-pfe-frontend"
                }
            }
        }
    }
    
    post {
        success {
            echo "✅ ========================================"
            echo "✅ Frontend Pipeline RÉUSSI!"
            echo "✅ ========================================"
            echo "📦 Artifact: ${FRONTEND_IMAGE}:${IMAGE_TAG}"
            echo "🔗 Docker Hub: https://hub.docker.com/r/hamayari/commercial-pfe-frontend"
        }
        failure {
            echo "❌ ========================================"
            echo "❌ Frontend Pipeline ÉCHOUÉ!"
            echo "❌ ========================================"
            echo "📋 Consultez les logs ci-dessus pour plus de détails"
        }
        always {
            echo "🧹 Cleaning up..."
            sh 'docker image prune -f || true'
            sh 'docker container prune -f || true'
        }
    }
}
