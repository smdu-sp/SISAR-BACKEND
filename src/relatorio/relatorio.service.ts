import { Injectable } from '@nestjs/common';
import { CreateRelatorioDto } from './dto/create-relatorio.dto';
import { AppService } from 'src/app.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class RelatorioService {
    constructor(
        private prisma: PrismaService,
        private app: AppService
    ) { }

    async relatorioQuantitativo() {
        const now = new Date();
        const primeiroDia = new Date(now.getFullYear(), now.getMonth(), 1);
        const ultimoDia = new Date(now.getFullYear(), now.getMonth() + 1, 0);

        const analise = await this.prisma.admissibilidade.count({
            where: {
                AND: [
                    { criado_em: { gte: primeiroDia } },
                    { criado_em: { lte: ultimoDia } },
                    { status: 1 },
                    { data_decisao_interlocutoria: null }
                ],
            }
        });

        const analise_geral = await this.prisma.admissibilidade.findMany({
            where: {
                AND: [
                    { criado_em: { gte: primeiroDia } },
                    { criado_em: { lte: ultimoDia } },
                    { status: 1 },
                    { data_decisao_interlocutoria: null }
                ],
            },
            select: {
                unidade: {
                    select: {
                        nome: true
                    }
                }
            }
        })

        const inadimissiveis = await this.prisma.admissibilidade.count({
            where: {
                AND: [
                    { criado_em: { gte: primeiroDia } },
                    { criado_em: { lte: ultimoDia } },
                    { status: 2 },
                    { data_decisao_interlocutoria: null }
                ],
            },
        })

        const admissiveis = await this.prisma.admissibilidade.count({
            where: {
                AND: [
                    { data_decisao_interlocutoria: { gte: primeiroDia } },
                    { data_decisao_interlocutoria: { lte: ultimoDia } },
                    { status: 0 },
                ],
            },
        })

        const data_gerado = new Date().toISOString().split("T")[0].replaceAll("-", "/").split('/').reverse().join('/')

        return {
            "total": analise + inadimissiveis + admissiveis,
            "analise": analise,
            "inadimissiveis": inadimissiveis,
            "admissiveis": admissiveis,
            "data_gerado": data_gerado,
            "teste": analise_geral
        };
    }

}