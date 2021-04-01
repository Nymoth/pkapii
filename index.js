import express from 'express';
import cors from 'cors';
import { MongoClient } from 'mongodb';
import { localeToLangId } from './core/locale';
import { getType } from './core/types';

require('dotenv').config();

async function main() {
  const { MONGODB_USER, MONGODB_PASS, MONGODB_URI, MONGODB_DBNAME } = process.env;

  if (!MONGODB_USER || !MONGODB_PASS, !MONGODB_URI || !MONGODB_DBNAME) {
    console.error('missing config');
    return;
  }

  const uri = MONGODB_URI
    .replace('__USER__', MONGODB_USER)
    .replace('__PASS__', MONGODB_PASS);

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  try {
    await client.connect();
    const db = client.db(MONGODB_DBNAME);
    await serveApp(db);
  } catch (e) {
    console.error(e);
  }
}

async function serveApp(db) {
  const app = express();
  app.use(cors());

  app.get('/list', async (req, res) => {
    const locale = localeToLangId(req.query.locale);
    const limit = req.query.limit ? +req.query.limit : 0;
    const skip = req.query.skip ? +req.query.skip : 0;

    const species = db.collection('pokemon_species_names');

    const aggregationPipeline = [{ $match: { local_language_id: locale } }];

    if (skip > 0) aggregationPipeline.push({ $skip: skip });

    if (limit > 0) aggregationPipeline.push({ $limit: limit });

    aggregationPipeline.push({
      $lookup: {
        from: 'pokemon_types',
        localField: 'pokemon_species_id',
        foreignField: 'pokemon_id',
        as: 'type_slots'
      }
    });

    const result = await species
      .aggregate(aggregationPipeline)
      .map(r => ({
        id: r.pokemon_species_id,
        name: r.name,
        types: r.type_slots.map(({ type_id }) => getType(type_id)),
        sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${r.pokemon_species_id}.png`
      }))
      .toArray();

    res.json(result);
  });

  app.listen(process.env.PORT || 3000, () => {
    console.log('api up')
  });
}

main().catch(console.error);
