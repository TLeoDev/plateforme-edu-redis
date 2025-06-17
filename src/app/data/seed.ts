import redis from '../../lib/redis';

async function isEmpty(pattern: string) {
    const keys = await redis.keys(pattern);
    return keys.length === 0;
}

async function seed() {
    // Cours
    if (await isEmpty('course:*')) {
        await redis.hset('course:math101', {
            title: 'Mathématiques 101',
            teacher: 'prof1',
            level: 'débutant',
            summary: 'Introduction aux mathématiques',
            placesAvailable: '30',
            students: JSON.stringify(['etud1']),
        });
        await redis.hset('course:phy201', {
            title: 'Physique 201',
            teacher: 'prof2',
            level: 'intermédiaire',
            summary: 'Physique classique',
            placesAvailable: '25',
            students: JSON.stringify([]),
        });
    }

    // Étudiants
    if (await isEmpty('student:*')) {
        await redis.hset('student:etud1', {
            name: 'Alice Dupont',
            courses: JSON.stringify(['math101']),
        });
        await redis.hset('student:etud2', {
            name: 'Bob Martin',
            courses: JSON.stringify([]),
        });
    }

    // Professeurs
    if (await isEmpty('professor:*')) {
        await redis.hset('professor:prof1', {
            name: 'Dr. Leblanc',
            courses: JSON.stringify(['math101']),
        });
        await redis.hset('professor:prof2', {
            name: 'Mme. Curie',
            courses: JSON.stringify(['phy201']),
        });
    }

    // News
    if (await isEmpty('news')) {
        await redis.lpush('news', JSON.stringify({
            courseId: 'math101',
            message: 'Bienvenue au cours de Mathématiques 101 !',
            timestamp: new Date().toISOString(),
        }));
    }

    console.log('Données de démonstration insérées (si la base était vide).');
    process.exit(0);
}

seed();