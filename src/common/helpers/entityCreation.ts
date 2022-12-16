
  // a function that helps create and save entities
  export  const createEntity = async (repo: any, data: any): Promise<any> => {
    const entity = await repo.create(data);
    const savedEntity: any = await repo.save(entity);
    return savedEntity
  }