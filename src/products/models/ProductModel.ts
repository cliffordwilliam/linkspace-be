import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity({ name: "product" })
export class ProductModel {
  @PrimaryGeneratedColumn("uuid")
  product_id!: string;

  @Column({ type: "varchar", length: 200, nullable: false })
  product_name!: string;

  @Column({ type: "boolean", default: false, nullable: false })
  deleted_status!: boolean;

  @CreateDateColumn({ type: "timestamptz", default: () => "CURRENT_TIMESTAMP" })
  date_created!: Date;

  @UpdateDateColumn({
    type: "timestamptz",
    default: () => "CURRENT_TIMESTAMP",
    onUpdate: "CURRENT_TIMESTAMP",
  })
  date_modified!: Date;
}
