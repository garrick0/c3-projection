/**
 * GraphLoader - Service for loading PropertyGraph from c3-parsing
 */

import {
  PropertyGraph,
  ParsingService,
  InMemoryGraphRepository,
  TypeScriptExtension,
  type GraphExtension
} from 'c3-parsing';
import { Logger } from 'c3-shared';

export interface GraphLoaderConfig {
  extensions: GraphExtension[];
  cacheEnabled?: boolean;
}

export class GraphLoader {
  constructor(
    private logger: Logger,
    private config: GraphLoaderConfig
  ) {}

  /**
   * Load PropertyGraph from c3-parsing
   */
  async loadGraph(rootPath: string): Promise<PropertyGraph> {
    this.logger.info('Loading PropertyGraph from c3-parsing', { rootPath });

    try {
      // Initialize repository
      const repository = new InMemoryGraphRepository();

      // Create parsing service with extensions
      const parsingService = new ParsingService(
        repository,
        this.logger,
        this.config.extensions
      );

      // Parse codebase
      const graph = await parsingService.parseCodebase(rootPath);

      this.logger.info('PropertyGraph loaded successfully', {
        nodes: graph.getNodeCount(),
        edges: graph.getEdgeCount()
      });

      // Clean up extensions manually
      for (const extension of this.config.extensions) {
        if (extension.dispose) {
          await extension.dispose();
        }
      }

      return graph;
    } catch (error) {
      this.logger.error('Failed to load PropertyGraph', error as Error);
      throw error;
    }
  }

  /**
   * Create default GraphLoader with TypeScript extension
   */
  static createDefault(logger: Logger): GraphLoader {
    const tsExtension = new TypeScriptExtension({
      tsconfigRootDir: process.cwd(),
      includePrivateMembers: false
    });

    return new GraphLoader(logger, {
      extensions: [tsExtension],
      cacheEnabled: true
    });
  }
}

