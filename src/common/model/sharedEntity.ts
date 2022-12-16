import {
    PrimaryGeneratedColumn,
    Column,
    BeforeUpdate,
    DeleteDateColumn,
    UpdateDateColumn,
    
  } from 'typeorm';
  
  export abstract class SharedEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
  
    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdOn: Date;
  
    @Column({ nullable: true })
    createdBy?: string;
  
    @Column({ nullable: true, type: 'timestamp' })
    updatedOn?: Date;
    
    //An alternative column to update column
    @UpdateDateColumn()
    updated_at: Date;

    @Column({ nullable: true })
    updatedBy?: string;
  
    @Column({ nullable: true, type: 'timestamp' })
    @DeleteDateColumn({ type: 'timestamp with time zone' })
    deletedOn?: Date;
  
    @Column({ nullable: true })
    deletedBy?: string;
    /**
     *
     */
  
    @BeforeUpdate()
    updateDates() {
      this.updatedOn = new Date();
    }
    



  }
  