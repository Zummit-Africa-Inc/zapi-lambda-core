import { SetMetadata } from '@nestjs/common';

export const IdCheck = (requiredId: string) => SetMetadata('id', requiredId);
