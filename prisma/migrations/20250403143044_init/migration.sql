-- CreateTable
CREATE TABLE `Impuesto` (
    `id` VARCHAR(191) NOT NULL,
    `nombreImpuesto` VARCHAR(191) NOT NULL,
    `empresa` VARCHAR(191) NOT NULL,
    `nit` VARCHAR(191) NOT NULL,
    `fechaVencimiento` DATETIME(3) NOT NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `emailCliente` VARCHAR(191) NOT NULL,
    `telefonoCliente` VARCHAR(191) NOT NULL,
    `emailContador` VARCHAR(191) NOT NULL,
    `telefonoContador` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
