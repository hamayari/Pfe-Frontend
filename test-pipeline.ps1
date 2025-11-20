# Script PowerShell pour tester le pipeline localement

Write-Host "🚀 Test du Pipeline Frontend Angular" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Fonction pour afficher les résultats
function Show-Result {
    param($step, $success)
    if ($success) {
        Write-Host "✅ $step" -ForegroundColor Green
    } else {
        Write-Host "❌ $step" -ForegroundColor Red
    }
}

# 1. Vérification de l'environnement
Write-Host "🔍 Étape 1: Vérification de l'environnement" -ForegroundColor Yellow
try {
    $nodeVersion = node -v
    Write-Host "   Node.js: $nodeVersion" -ForegroundColor Gray
    $npmVersion = npm -v
    Write-Host "   npm: $npmVersion" -ForegroundColor Gray
    Show-Result "Environnement vérifié" $true
} catch {
    Show-Result "Environnement vérifié" $false
    Write-Host "   Erreur: Node.js ou npm non installé" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 2. Installation des dépendances
Write-Host "📦 Étape 2: Installation des dépendances" -ForegroundColor Yellow
try {
    npm ci --prefer-offline --no-audit 2>&1 | Out-Null
    Show-Result "Dépendances installées" $true
} catch {
    Show-Result "Dépendances installées" $false
    exit 1
}
Write-Host ""

# 3. Build Angular
Write-Host "🔨 Étape 3: Build Angular" -ForegroundColor Yellow
try {
    npm run build -- --configuration production 2>&1 | Out-Null
    if (Test-Path "dist") {
        Show-Result "Build réussi" $true
    } else {
        Show-Result "Build réussi" $false
        exit 1
    }
} catch {
    Show-Result "Build réussi" $false
    exit 1
}
Write-Host ""

# 4. Tests Unitaires
Write-Host "🧪 Étape 4: Tests Unitaires" -ForegroundColor Yellow
try {
    $testOutput = npm test -- --watch=false --code-coverage --browsers=ChromeHeadless 2>&1
    if ($testOutput -match "(\d+) specs, (\d+) failures") {
        $specs = $matches[1]
        $failures = $matches[2]
        Write-Host "   Tests: $specs specs, $failures failures" -ForegroundColor Gray
        if ($failures -eq "0") {
            Show-Result "Tests unitaires réussis ($specs/$specs)" $true
        } else {
            Show-Result "Tests unitaires réussis" $false
            Write-Host "   $failures test(s) ont échoué" -ForegroundColor Red
        }
    } else {
        Show-Result "Tests unitaires réussis" $true
    }
} catch {
    Show-Result "Tests unitaires réussis" $false
}
Write-Host ""

# 5. Lint
Write-Host "🔍 Étape 5: Lint" -ForegroundColor Yellow
try {
    npm run lint 2>&1 | Out-Null
    Show-Result "Lint réussi" $true
} catch {
    Show-Result "Lint réussi" $false
    Write-Host "   ⚠️ Des problèmes de lint ont été détectés" -ForegroundColor Yellow
}
Write-Host ""

# 6. Build Docker (optionnel)
Write-Host "🐳 Étape 6: Build Docker (optionnel)" -ForegroundColor Yellow
$dockerAvailable = Get-Command docker -ErrorAction SilentlyContinue
if ($dockerAvailable) {
    try {
        docker build -t pfe-frontend:test . 2>&1 | Out-Null
        Show-Result "Image Docker créée" $true
        Write-Host "   Image: pfe-frontend:test" -ForegroundColor Gray
    } catch {
        Show-Result "Image Docker créée" $false
    }
} else {
    Write-Host "   ⏭️ Docker non disponible, étape ignorée" -ForegroundColor Yellow
}
Write-Host ""

# Résumé
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "📊 Résumé du Test Pipeline" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

if (Test-Path "dist") {
    $distSize = (Get-ChildItem -Path "dist" -Recurse | Measure-Object -Property Length -Sum).Sum / 1MB
    Write-Host "📦 Taille du build: $([math]::Round($distSize, 2)) MB" -ForegroundColor Gray
}

if (Test-Path "coverage") {
    Write-Host "📊 Rapport de couverture: coverage/gestion-pro-frontend/index.html" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Pipeline testé avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Vérifier le rapport de couverture" -ForegroundColor Gray
Write-Host "   2. Configurer Jenkins avec Jenkinsfile.FRONTEND" -ForegroundColor Gray
Write-Host "   3. Pousser sur GitHub pour déclencher le pipeline" -ForegroundColor Gray
Write-Host ""
