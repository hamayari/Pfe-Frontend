# Installation karma-junit-reporter

Pour que les tests génèrent des rapports XML pour Jenkins, il faut installer :

```bash
npm install --save-dev karma-junit-reporter
```

Puis relancer les tests :

```bash
npm test -- --watch=false --browsers=ChromeHeadless
```

Les rapports seront générés dans `test-results/TESTS-results.xml`
