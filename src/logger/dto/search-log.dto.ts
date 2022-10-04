import { ApiProperty } from "@nestjs/swagger"
import { Action } from "src/common/enums/actionLogger.enum"

export class SearchLogDto {
    @ApiProperty()
    searchField: string

    @ApiProperty()
    action: Action

}