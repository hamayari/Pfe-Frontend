# Configuration Jenkins pour Frontend Angular

## 📋 Prérequis

### 1. Installer NodeJS dans Jenkins
1. Aller dans **Manage Jenkins** → **Global Tool Configuration**
2. Ajouter **NodeJS**
   - Name: `nodejs`
   - Version: `18.x` ou supérieur
   - Cocher "Install automatically"

### 2. Installer Chrome/Chromium pour les tests
```bash
# Sur le serveur Jenkins (Linux)
sudo apt-get update
sudo apt-get install -y chromium-browser

# Ou Chrome
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get install -f
```

### 3. Configurer Docker Hub Credentials
1. Aller dans **Manage Jenkins** → **Credentials**
2. Ajouter **Username with password**
   - ID: `dockerhub-credentials`
   - Username: votre username Docker Hub
   - Password: votre token Docker Hub

### 4. Configurer SonarQube Token
1. Aller dans **Manage Jenkins** → **Credentials**
2. Ajouter **Secret text**
   - ID: `sonar`
   - Secret: votre token SonarQube

## 🚀 Créer le Job Jenkins

### Option 1: Pipeline depuis SCM (Recommandé)
1. **New Item** → **Pipeline**
2. Nom: `Frontend-CI-CD`
3. Dans **Pipeline**:
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/hamayari/Pfe-Frontend.git`
   - Branch: `*/main`
   - Script Path: `Jenkinsfile.FRONTEND`

### Option 2: Pipeline Script Direct
1. **New Item** → **Pipeline**
2. Nom: `Frontend-CI-CD`
3. Copier le contenu de `Jenkinsfile.FRONTEND` dans **Pipeline Script**

## 📊 Stages du Pipeline

### 1. 🧹 Cleanup & Checkout
- Nettoie le workspace
- Clone le repository Git

### 2. 🔍 Vérification Environnement
- Vérifie Node.js, npm, Angular CLI

### 3. 📦 Installation Dépendances
- `npm ci` pour installer les dépendances

### 4. 🔨 Build Angular
- `npm run build --configuration production`
- Génère les fichiers dans `dist/`

### 5. 🧪 Tests Unitaires
- Exécute Karma/Jasmine avec ChromeHeadless
- Génère le rapport de couverture
- **174 tests** doivent passer

### 6. 🔍 Lint & Quality
- Vérifie la qualité du code TypeScript

### 7. 🐳 Build Docker Image
- Construit l'image Docker multi-stage
- Tags: `build-number`, `latest`, `branch-latest`

### 8. 📤 Push Docker Hub
- Push uniquement sur la branche `main`
- Nécessite les credentials Docker Hub

### 9. 📊 Analyse SonarQube
- Analyse statique du code
- Couverture de tests

### 10. 🚦 Quality Gate
- Vérifie les seuils de qualité SonarQube

### 11. 📦 Archive Artifacts
- Archive les fichiers `dist/`

## 🎯 Résultats Attendus

### Tests Unitaires
- ✅ **174 specs, 0 failures**
- ✅ Couverture: objectif 80%

### Build Docker
- ✅ Image: `hamalak/pfe-frontend:BUILD_NUMBER`
- ✅ Image: `hamalak/pfe-frontend:latest`
- ✅ Image: `hamalak/pfe-frontend:main-latest`

### Artifacts
- ✅ Rapport de couverture HTML
- ✅ Résultats des tests JUnit
- ✅ Fichiers `dist/` archivés

## 🔧 Configuration Avancée

### Variables d'Environnement
Modifier dans le Jenkinsfile:
```groovy
environment {
    DOCKER_IMAGE = 'votre-username/pfe-frontend'
    GIT_REPO = 'https://github.com/votre-repo/frontend.git'
    GIT_BRANCH = 'main'
}
```

### Branches Multiples
Pour activer le pipeline sur plusieurs branches:
1. Créer un **Multibranch Pipeline**
2. Configurer la source Git
3. Le Jenkinsfile sera détecté automatiquement

### Notifications
Ajouter dans la section `post`:
```groovy
post {
    success {
        emailext (
            subject: "✅ Frontend Build Success: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Le build frontend a réussi!",
            to: "team@example.com"
        )
    }
    failure {
        emailext (
            subject: "❌ Frontend Build Failed: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
            body: "Le build frontend a échoué!",
            to: "team@example.com"
        )
    }
}
```

## 🐳 Déploiement Docker

### Lancer l'image localement
```bash
docker pull hamalak/pfe-frontend:latest
docker run -d -p 80:80 hamalak/pfe-frontend:latest
```

### Docker Compose
```yaml
version: '3.8'
services:
  frontend:
    image: hamalak/pfe-frontend:latest
    ports:
      - "80:80"
    restart: unless-stopped
```

## 📝 Commandes Utiles

### Tester localement
```bash
# Installation
npm ci

# Build
npm run build

# Tests
npm test -- --watch=false --browsers=ChromeHeadless

# Lint
npm run lint

# Build Docker
docker build -t pfe-frontend:test .

# Run Docker
docker run -p 8080:80 pfe-frontend:test
```

## 🔍 Troubleshooting

### Erreur: Chrome not found
```bash
# Installer Chrome sur Jenkins
sudo apt-get install -y chromium-browser
# Ou définir CHROME_BIN dans le Jenkinsfile
```

### Erreur: npm ci failed
```bash
# Nettoyer le cache npm
npm cache clean --force
# Supprimer node_modules et package-lock.json
rm -rf node_modules package-lock.json
npm install
```

### Erreur: Tests timeout
```bash
# Augmenter le timeout dans karma.conf.js
browserNoActivityTimeout: 60000
captureTimeout: 60000
```

### Erreur: Docker push denied
```bash
# Vérifier les credentials Docker Hub dans Jenkins
# Credentials ID doit être: dockerhub-credentials
```

## 📊 Métriques de Qualité

### Objectifs
- ✅ Tests: 100% de réussite (174/174)
- ✅ Couverture: ≥ 80%
- ✅ Build time: < 10 minutes
- ✅ Image Docker: < 50 MB (avec nginx:alpine)

### SonarQube
- Bugs: 0
- Vulnerabilities: 0
- Code Smells: < 50
- Coverage: ≥ 80%
- Duplications: < 3%

## 🎓 Bonnes Pratiques

1. **Toujours tester localement** avant de pousser
2. **Utiliser des branches** pour les features
3. **Merger sur main** uniquement après validation
4. **Surveiller les rapports** de couverture
5. **Nettoyer les images Docker** régulièrement

---

**Pipeline créé avec succès ! 🚀**
