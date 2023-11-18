import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
export class ProductoDto {

    @IsString()
    @IsNotEmpty()
    readonly nombre: string;

    @IsNumber()
    @IsNotEmpty()
    readonly price: number

    @IsString()
    @IsNotEmpty()
    readonly tipo: string;
}