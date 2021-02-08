package walksrc

import (
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
)

func ExtractSchemaInfo(root, srcdir, ext string) {
	walkDir, err := filepath.Abs(path.Join(root, srcdir))
	if err != nil {
		log.Fatalf("could not create path to the walk dir:\n%s", err)
	}

	buildDir, err := filepath.Abs(path.Join(root, "src", "node_modules", "@tempo"))
	if err != nil {
		log.Fatalf("could not create path to the build dir:\n%s", err)
	}
	if _, err := os.Stat(buildDir); os.IsNotExist(err) {
		os.MkdirAll(buildDir, os.ModePerm)
	}

	rel, err := filepath.Rel(root, buildDir)
	if err != nil {
		log.Fatalf("could not find the relative path of the build directory:\n%s", err)
	}
	depth := len(strings.Split(rel, string(filepath.Separator))) - 1 // adjust depth for build dir being inside the src
	var relativeRoot = strings.Repeat("../", depth)

	var schema []byte
	var imports strings.Builder
	var mutationMap strings.Builder
	var queryMap strings.Builder
	var wg sync.WaitGroup

	err = filepath.Walk(walkDir, func(fp string, info os.FileInfo, err error) error {
		if info.IsDir() {
			if info.Name() == ".git" || info.Name() == "node_modules" || info.Name() == "utils" {
				return filepath.SkipDir // Skip specified directories
			}
			return nil // Early return for directories
		}

		if info.Name()[0] == 95 {
			return nil // Early return if the file starts with an underscore
		}

		// Concatenate graphql files
		if filepath.Ext(fp) == ".graphql" && ext == ".graphql" || filepath.Ext(fp) == ".graphql" && ext == "any" {
			wg.Add(1)
			go func(path string) {
				contents, err := ioutil.ReadFile(path)
				if err != nil {
					log.Fatalf("could not read file at path: %s\n%s", path, err)
				}

				schema = append(schema, contents...)
				wg.Done()
			}(fp)
		}

		// Handle .js and .ts files
		if ext == ".js" || ext == ".ts" || ext == "any" {
			if filepath.Ext(fp) == ".js" || filepath.Ext(fp) == ".ts" {
				if strings.Contains(fp, "mutation") || strings.Contains(fp, "query") {
					wg.Add(1)
					go func(p, s, n string) {
						relPath := strings.Split(p, s)[1][1:]
						fnToJs := strings.TrimSuffix(filepath.ToSlash(relPath), filepath.Ext(n))
						functionName := strings.TrimSuffix(n, filepath.Ext(n))

						fmt.Fprintf(&imports, "import { %s } from \"%s%s\";\n", functionName, relativeRoot, fmt.Sprintf("%s.js", fnToJs))

						if strings.Contains(fp, "mutation") {
							fmt.Fprintf(&mutationMap, "\n\t\t%s,", functionName)
						}

						if strings.Contains(fp, "query") {
							fmt.Fprintf(&queryMap, "\n\t\t%s,", functionName)
						}

						wg.Done()
					}(fp, srcdir, info.Name())
				}
			}
		}

		return nil
	})

	if err != nil {
		log.Fatalf("failed to walk filepath:\n%s", err)
	}

	wg.Wait()

	if ext == ".graphql" || ext == "any" {
		/**
		 * Output typeDefs
		 */
		tempDir, err := filepath.Abs(path.Join("../../", "temp"))
		if err != nil {
			log.Fatalf("could not create path for the tempDir:\n%s", err)
		}
		err = os.RemoveAll(tempDir)
		if err != nil {
			log.Fatal(err)
		}
		os.MkdirAll(tempDir, os.ModePerm)

		typeDefsOutputPath, err := filepath.Abs(path.Join(tempDir, "typeDefs.graphql"))
		if err != nil {
			log.Fatalf("could not create path for typeDefs.graphql:\n%s", err)
		}
		err = ioutil.WriteFile(typeDefsOutputPath, schema, 0644)
		if err != nil {
			log.Fatalf("could not write typeDefs.graphql:\n%s", err)
		}
	}

	if ext == ".js" || ext == ".ts" || ext == "any" {
		var resolverMap strings.Builder
		fmt.Fprintf(&resolverMap, "%s\nexport const resolvers = {\n\tMutation: {%s\n\t},\n\tQuery: {%s\n\t},\n}\n", imports.String(), mutationMap.String(), queryMap.String())

		/**
		 * Output resolvers
		 */
		resolverMapOutputPath, err := filepath.Abs(path.Join(buildDir, "resolvers.js"))
		if err != nil {
			log.Fatalf("could not create path for resolvers.js:\n%s", err)
		}
		err = os.RemoveAll(resolverMapOutputPath)
		if err != nil {
			log.Fatal(err)
		}
		err = ioutil.WriteFile(resolverMapOutputPath, []byte(resolverMap.String()), 0644)
		if err != nil {
			log.Fatalf("could not write resolvers.js:\n%s", err)
		}
	}
}
