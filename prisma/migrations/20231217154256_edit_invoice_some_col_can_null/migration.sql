-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `invoice_customerId_fkey`;

-- DropForeignKey
ALTER TABLE `invoice` DROP FOREIGN KEY `invoice_sellerId_fkey`;

-- AlterTable
ALTER TABLE `invoice` MODIFY `sellerId` INTEGER NULL,
    MODIFY `dueDate` DATETIME(3) NULL,
    MODIFY `customerId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invoice` ADD CONSTRAINT `invoice_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `shop_user`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
