import { ProductD2Repository } from "./data/repositories/ProductD2Repository";
import { ProductTestRepository } from "./data/repositories/ProductTestRepository";
import { UserD2Repository } from "./data/repositories/UserD2Repository";
import { UserTestRepository } from "./data/repositories/UserTestRepository";
import { ProductRepository } from "./domain/repositories/ProductRepository";
import { UserRepository } from "./domain/repositories/UserRepository";
import { GetCurrentUserUseCase } from "./domain/usecases/GetCurrentUserUseCase";
import { GetProductByIdUseCase } from "./domain/usecases/GetProductByIdUseCase";
import { GetProductsUseCase } from "./domain/usecases/GetProductsUseCase";
import { UpdateProductQuantityUseCase } from "./domain/usecases/UpdateProductQuantityUseCase";
import { D2Api } from "./types/d2-api";

export type CompositionRoot = ReturnType<typeof getCompositionRoot>;

type Repositories = {
    usersRepository: UserRepository;
    productRepository: ProductRepository;
};

function getCompositionRoot(repositories: Repositories, api?: D2Api) {
    return {
        users: {
            getCurrent: new GetCurrentUserUseCase(repositories.usersRepository),
        },
        api: {
            get: api,
        },
        products: {
            getAll: new GetProductsUseCase(repositories.productRepository),
            getById: new GetProductByIdUseCase(repositories.productRepository),
            update: new UpdateProductQuantityUseCase(repositories.productRepository),
        },
    };
}

export function getWebappCompositionRoot(api: D2Api) {
    const repositories: Repositories = {
        usersRepository: new UserD2Repository(api),
        productRepository: new ProductD2Repository(api),
    };

    return getCompositionRoot(repositories, api);
}

export function getTestCompositionRoot() {
    const repositories: Repositories = {
        usersRepository: new UserTestRepository(),
        productRepository: new ProductTestRepository(),
    };

    return getCompositionRoot(repositories);
}
