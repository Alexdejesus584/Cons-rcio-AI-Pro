const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const senha_hash = await bcrypt.hash('admin123', 10);

    const user = await prisma.usuario.upsert({
        where: { email: 'admin@admin.com' },
        update: {},
        create: {
            nome: 'Administrador',
            email: 'admin@admin.com',
            senha_hash,
            role: 'ADMIN'
        },
    });

    console.log('Usuário admin criado/verificado:', user.email);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
