// Scaffolds sdks/<repo> from template/ for one language.
// Usage: node tools/new-sdk.mjs <php|node|nextjs|python|go|java|kotlin|csharp|ruby|dart> [--force]
// README sections marked <!-- TODO:name --> are filled in by hand when the SDK is written; tools/check-repo.mjs fails while any remain.
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync, copyFileSync } from "node:fs"
import { dirname, resolve, join } from "node:path"
import { fileURLToPath } from "node:url"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const OWNER = "AmDev255"
const today = new Date().toISOString().slice(0, 10)

const ci = (setup, steps) => `name: CI

on:
  push:
    branches: [main]
  pull_request:

permissions:
  contents: read

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
${setup}
${steps}
`

export const LANGS = {
  php: {
    repo: "paysafe-php", title: "PHP", package: "paysafe-tz/paysafe-php", installLang: "bash", codeLang: "php",
    install: "composer require paysafe-tz/paysafe-php",
    requirements: "PHP 8.1 or newer with the `curl` and `json` extensions. Any PSR-18 HTTP client can be injected; Guzzle 7 is installed by default.",
    devSetup: "composer install", devCheck: "composer check   # php-cs-fixer, phpstan, phpunit",
    ignore: "/vendor/\ncomposer.lock\n.phpunit.cache/\n.php-cs-fixer.cache\n.env\n",
    ci: ci(`      - uses: shivammathur/setup-php@v2
        with:
          php-version: "8.1"
          coverage: none
      - run: composer install --no-interaction --prefer-dist`, `      - run: composer validate --strict
      - run: vendor/bin/php-cs-fixer fix --dry-run --diff
      - run: vendor/bin/phpstan analyse
      - run: vendor/bin/phpunit`),
    releaseSetup: `      - uses: shivammathur/setup-php@v2
        with:
          php-version: "8.1"`, releaseBuild: "          composer validate --strict\n          composer archive --format=zip --dir=dist", releaseArtifact: "dist/*.zip", publish: "Packagist publishes from the GitHub tag; nothing to upload",
  },
  node: {
    repo: "paysafe-node", title: "Node.js", package: "paysafe-tz", installLang: "bash", codeLang: "ts",
    install: "npm install paysafe-tz",
    requirements: "Node.js 20 or newer (uses the global `fetch`). Written in TypeScript; ships ESM and CommonJS builds with bundled type definitions, so it works from plain JavaScript and from TypeScript. Also runs on Bun and Deno with Node compatibility.",
    devSetup: "npm install", devCheck: "npm run check   # prettier, eslint, tsc, vitest, build",
    ignore: "node_modules/\ndist/\ncoverage/\n.env\n*.tgz\n",
    ci: ci(`      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci`, `      - run: npm run format:check
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - run: npm pack --dry-run`),
    releaseSetup: `      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci`, releaseBuild: "          npm run build\n          npm pack", releaseArtifact: "*.tgz", publish: "npm publish --access public",
  },
  nextjs: {
    repo: "paysafe-nextjs", title: "Next.js", package: "paysafe-tz-nextjs", installLang: "bash", codeLang: "ts",
    install: "npm install paysafe-tz paysafe-tz-nextjs",
    requirements: "Next.js 14 or 15 (App Router) on Node.js 20 or newer. Depends on the `paysafe-tz` Node.js SDK as a peer dependency. Server-side only: the secret key never reaches the browser.",
    devSetup: "npm install", devCheck: "npm run check   # prettier, eslint, tsc, vitest, build",
    ignore: "node_modules/\ndist/\n.next/\ncoverage/\n.env*\n!.env.example\n*.tgz\n",
    ci: ci(`      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci`, `      - run: npm run format:check
      - run: npm run lint
      - run: npm run typecheck
      - run: npm test
      - run: npm run build
      - run: npm pack --dry-run`),
    releaseSetup: `      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci`, releaseBuild: "          npm run build\n          npm pack", releaseArtifact: "*.tgz", publish: "npm publish --access public",
  },
  python: {
    repo: "paysafe-python", title: "Python", package: "paysafe-tz", installLang: "bash", codeLang: "python",
    install: "pip install paysafe-tz",
    requirements: "Python 3.9 or newer. Depends on `httpx`; the async client uses `asyncio`.",
    devSetup: "python -m venv .venv && . .venv/bin/activate && pip install -e '.[dev]'", devCheck: "ruff check . && ruff format --check . && mypy src && pytest",
    ignore: ".venv/\n__pycache__/\n*.egg-info/\ndist/\nbuild/\n.pytest_cache/\n.mypy_cache/\n.ruff_cache/\n.env\n",
    ci: ci(`      - uses: actions/setup-python@v5
        with:
          python-version: "3.9"
      - run: pip install -e '.[dev]'`, `      - run: ruff check .
      - run: ruff format --check .
      - run: mypy src
      - run: pytest
      - run: pip install build && python -m build`),
    releaseSetup: `      - uses: actions/setup-python@v5
        with:
          python-version: "3.12"
      - run: pip install build`, releaseBuild: "          python -m build", releaseArtifact: "dist/*", publish: "twine upload dist/*",
  },
  go: {
    repo: "paysafe-go", title: "Go", package: "github.com/AmDev255/paysafe-go", installLang: "bash", codeLang: "go",
    install: "go get github.com/AmDev255/paysafe-go",
    requirements: "Go 1.21 or newer. No dependencies outside the standard library.",
    devSetup: "go mod download", devCheck: "gofmt -l . && go vet ./... && go test ./...",
    ignore: ".env\ncoverage.out\n",
    ci: ci(`      - uses: actions/setup-go@v5
        with:
          go-version: "1.21"`, `      - run: test -z "$(gofmt -l .)"
      - run: go vet ./...
      - run: go run honnef.co/go/tools/cmd/staticcheck@2023.1.7 ./...
      - run: go test ./...
      - run: go build ./...`),
    releaseSetup: `      - uses: actions/setup-go@v5
        with:
          go-version: "1.21"`, releaseBuild: "          go build ./... && go test ./... && mkdir -p dist && git archive --format=zip -o dist/source.zip HEAD", releaseArtifact: "dist/*", publish: "Go modules are served from the git tag; nothing to upload",
  },
  java: {
    repo: "paysafe-java", title: "Java", package: "tz.co.paysafe:paysafe-java", installLang: "xml", codeLang: "java",
    install: "<dependency>\n  <groupId>tz.co.paysafe</groupId>\n  <artifactId>paysafe-java</artifactId>\n  <version>0.1.0</version>\n</dependency>",
    requirements: "JDK 17 or newer. Uses `java.net.http.HttpClient` and Jackson for JSON.",
    devSetup: "mvn -q dependency:resolve", devCheck: "mvn -B verify   # spotless check, tests, jar",
    ignore: "target/\n.env\n*.iml\n.idea/\n",
    ci: ci(`      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
          cache: maven`, `      - run: mvn -B spotless:check
      - run: mvn -B verify`),
    releaseSetup: `      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"`, releaseBuild: "          mvn -B -DskipTests package", releaseArtifact: "target/*.jar", publish: "mvn deploy (Sonatype Central, requires tz.co.paysafe namespace verification)",
  },
  kotlin: {
    repo: "paysafe-kotlin", title: "Kotlin", package: "tz.co.paysafe:paysafe-kotlin", installLang: "kotlin", codeLang: "kotlin",
    install: "dependencies {\n    implementation(\"tz.co.paysafe:paysafe-kotlin:0.1.0\")\n}",
    requirements: "Kotlin 1.9 or newer on JDK 17 or newer. Uses OkHttp 4 and kotlinx.serialization; suspend functions need kotlinx-coroutines.",
    devSetup: "./gradlew build", devCheck: "./gradlew ktlintCheck test",
    ignore: ".gradle/\nbuild/\n.env\n*.iml\n.idea/\n",
    ci: ci(`      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
      - uses: gradle/actions/setup-gradle@v3`, `      - run: ./gradlew ktlintCheck
      - run: ./gradlew test
      - run: ./gradlew build`),
    releaseSetup: `      - uses: actions/setup-java@v4
        with:
          distribution: temurin
          java-version: "17"
      - uses: gradle/actions/setup-gradle@v3`, releaseBuild: "          ./gradlew build -x test", releaseArtifact: "build/libs/*.jar", publish: "./gradlew publish (Sonatype Central)",
  },
  csharp: {
    repo: "paysafe-dotnet", title: ".NET", package: "PaySafe.Tz", installLang: "bash", codeLang: "csharp",
    install: "dotnet add package PaySafe.Tz",
    requirements: ".NET 8 or newer. Uses `HttpClient` and `System.Text.Json`; all calls are async.",
    devSetup: "dotnet restore", devCheck: "dotnet format --verify-no-changes && dotnet test",
    ignore: "bin/\nobj/\n.env\n*.user\n.vs/\n",
    ci: ci(`      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "8.0.x"
      - run: dotnet restore`, `      - run: dotnet format --verify-no-changes
      - run: dotnet build --no-restore -warnaserror
      - run: dotnet test --no-build
      - run: dotnet pack src/PaySafe/PaySafe.csproj --no-build -o dist`),
    releaseSetup: `      - uses: actions/setup-dotnet@v4
        with:
          dotnet-version: "8.0.x"`, releaseBuild: "          dotnet pack src/PaySafe/PaySafe.csproj -c Release -o dist", releaseArtifact: "dist/*.nupkg", publish: "dotnet nuget push dist/*.nupkg",
  },
  ruby: {
    repo: "paysafe-ruby", title: "Ruby", package: "paysafe-tz", installLang: "bash", codeLang: "ruby",
    install: "gem install paysafe-tz\n# or in your Gemfile\ngem \"paysafe-tz\"",
    requirements: "Ruby 3.1 or newer. Uses `Net::HTTP` from the standard library.",
    devSetup: "bundle install", devCheck: "bundle exec rubocop && bundle exec rspec",
    ignore: "/.bundle/\n/vendor/bundle/\n/pkg/\n/coverage/\n.env\nGemfile.lock\n",
    ci: ci(`      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.1"
          bundler-cache: true`, `      - run: bundle exec rubocop
      - run: bundle exec rspec
      - run: gem build *.gemspec`),
    releaseSetup: `      - uses: ruby/setup-ruby@v1
        with:
          ruby-version: "3.1"
          bundler-cache: true`, releaseBuild: "          gem build *.gemspec", releaseArtifact: "*.gem", publish: "gem push *.gem",
  },
  dart: {
    repo: "paysafe-dart", title: "Dart", package: "paysafe_tz", installLang: "bash", codeLang: "dart",
    install: "dart pub add paysafe_tz\n# Flutter apps: never embed a secret key in the app; call the API from your server",
    requirements: "Dart 3 or newer. Depends on `http` and `crypto`. Intended for server-side Dart; secret keys must not ship inside Flutter apps.",
    devSetup: "dart pub get", devCheck: "dart format --output=none --set-exit-if-changed . && dart analyze && dart test",
    ignore: ".dart_tool/\nbuild/\n.env\npubspec.lock\n",
    ci: ci(`      - uses: dart-lang/setup-dart@v1
        with:
          sdk: stable
      - run: dart pub get`, `      - run: dart format --output=none --set-exit-if-changed .
      - run: dart analyze --fatal-infos
      - run: dart test
      - run: dart pub publish --dry-run`),
    releaseSetup: `      - uses: dart-lang/setup-dart@v1
        with:
          sdk: stable
      - run: dart pub get`, releaseBuild: "          dart pub publish --dry-run && mkdir -p dist && git archive --format=zip -o dist/source.zip HEAD", releaseArtifact: "dist/*", publish: "dart pub publish",
  },
}

function copyDir(src, dst, replace) {
  mkdirSync(dst, { recursive: true })
  for (const name of readdirSync(src)) {
    const s = join(src, name), d = join(dst, name)
    if (statSync(s).isDirectory()) copyDir(s, d, replace)
    else writeFileSync(d, replace(readFileSync(s, "utf8")))
  }
}

export function scaffold(lang, force = false) {
  const L = LANGS[lang]
  if (!L) throw new Error(`unknown language ${lang}; one of ${Object.keys(LANGS).join(", ")}`)
  const dest = resolve(root, "sdks", L.repo)
  if (existsSync(dest) && !force) throw new Error(`${dest} exists; pass --force to overwrite template files only`)
  const vars = {
    OWNER, LANG_TITLE: L.title, REPO: L.repo, PACKAGE: L.package, INSTALL: L.install, INSTALL_LANG: L.installLang, CODE_LANG: L.codeLang,
    REQUIREMENTS: L.requirements, DEV_SETUP: L.devSetup, DEV_CHECK: L.devCheck, DATE: today, YEAR: today.slice(0, 4),
    RELEASE_SETUP: L.releaseSetup, RELEASE_BUILD: L.releaseBuild, RELEASE_ARTIFACT: L.releaseArtifact, PUBLISH_COMMAND: L.publish,
    QUICKSTART: "<!-- TODO:QUICKSTART -->", USAGE: "<!-- TODO:USAGE -->", ERRORS: "<!-- TODO:ERRORS -->", WEBHOOKS: "<!-- TODO:WEBHOOKS -->", TESTING: "<!-- TODO:TESTING -->",
  }
  const replace = (text) => text.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m))
  copyDir(resolve(root, "template"), dest, replace)
  mkdirSync(resolve(dest, ".github/workflows"), { recursive: true })
  writeFileSync(resolve(dest, ".github/workflows/ci.yml"), L.ci)
  writeFileSync(resolve(dest, ".gitignore"), L.ignore)
  const fx = resolve(dest, "tests/fixtures")
  mkdirSync(fx, { recursive: true })
  for (const f of readdirSync(resolve(root, "contract/fixtures"))) copyFileSync(resolve(root, "contract/fixtures", f), join(fx, f))
  mkdirSync(resolve(dest, "examples/webhooks"), { recursive: true })
  return dest
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const [lang, flag] = process.argv.slice(2)
  if (!lang) { console.error("usage: node tools/new-sdk.mjs <lang> [--force]"); process.exit(2) }
  console.log("scaffolded", scaffold(lang, flag === "--force"))
}
