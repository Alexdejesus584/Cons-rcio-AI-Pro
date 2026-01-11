// Script para corrigir escopos do admin
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixAdminScopes() {
    try {
        const defaultScopes = [
            "ia:execute",
            "knowledge:write",
            "knowledge:read",
            "materiais:write",
            "leads:read"
        ];

        const result = await prisma.usuario.updateMany({
            where: { role: 'ADMIN' },
            data: { scopes: JSON.stringify(defaultScopes) }
        });

        console.log(`✅ Atualizado ${result.count} usuário(s) admin com os escopos corretos:`);
        console.log(defaultScopes);

        // Mostrar usuários atualizados
        const admins = await prisma.usuario.findMany({ where: { role: 'ADMIN' } });
        admins.forEach(a => {
            console.log(`   - ${a.email}: ${a.scopes}`);
        });

    } catch (error) {
        console.error('❌ Erro:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdminScopes();
