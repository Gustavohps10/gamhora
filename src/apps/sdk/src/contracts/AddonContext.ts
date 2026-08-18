// /**
//  * Registry responsável por receber implementações de Data Sources.
//  */
// export interface IDataSourceRegistry {
//   register(dataSource: IDataSource): void
// }

// /**
//  * Contexto entregue ao Addon no momento da inicialização (activate).
//  */
// export interface AddonContext {
//   readonly dataSources: IDataSourceRegistry

//   /**
//    * Registro de comandos, atalhos e itens de menu na UI
//    */
//   readonly menus: IMenuRegistry

//   /**
//    * Barramento para escutar eventos do Core ou emitir eventos customizados
//    */
//   readonly events: IEventBus
// }
