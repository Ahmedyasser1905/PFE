import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import * as path from 'path';
import Category from '../models/Category';
import Material from '../models/Material';
import { v4 as uuidv4 } from 'uuid';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const seedCatalog = async () => {
    try {
        console.log('Connecting to database...');
        const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/buildest';
        await mongoose.connect(mongoUri);
        console.log('Database connected.');

        console.log('Clearing old catalog...');
        await Category.deleteMany({});
        await Material.deleteMany({});

        // ─── 1. ROOT Categories ──────────────────────────────────────────────
        const civilRoot = await Category.create({
            name: 'Civil Works',
            type: 'ROOT',
            icon: 'Building2',
            description: 'Structural and foundation elements',
            formulas: []
        });

        const electricalRoot = await Category.create({
            name: 'Electrical',
            type: 'ROOT',
            icon: 'Zap',
            description: 'Wiring and power distribution',
            formulas: []
        });

        // ─── 2. BRANCH Categories ─────────────────────────────────────────────
        const concreteBranch = await Category.create({
            name: 'Concrete Structures',
            type: 'BRANCH',
            parent_id: civilRoot._id,
            description: 'Columns, Slabs, Beams',
            formulas: []
        });

        // ─── 3. LEAF Categories with Formulas ────────────────────────────────
        
        // Leaf: Slab Concrete
        const slabFormulaId = uuidv4();
        const slabLeaf = await Category.create({
            name: 'Slab Pouring',
            type: 'LEAF',
            parent_id: concreteBranch._id,
            description: 'Calculate volume and rebar for a floor slab',
            config: {
                requires_volume: true,
                requires_area: true,
                requires_length: false,
                dependencies: []
            },
            formulas: [
                {
                    formula_id: slabFormulaId,
                    name: 'Standard Rectangular Volume',
                    type: 'VOLUME',
                    description: 'L * W * H',
                    fields: [
                        { name: 'length', type: 'number', unit: 'm', description: 'Length of slab', required: true },
                        { name: 'width', type: 'number', unit: 'm', description: 'Width of slab', required: true },
                        { name: 'thickness', type: 'number', unit: 'm', description: 'Thickness (height) of slab', required: true }
                    ]
                }
            ]
        });

        // ─── 4. Materials ────────────────────────────────────────────────────
        await Material.create({
            name: 'Ready-mix Concrete (B25)',
            description: 'Standard load-bearing concrete mix',
            unit: 'm³',
            unit_price: 120, // $120 per cubic meter
            waste_factor_default: 5,
            category_id: slabLeaf._id
        });

        await Material.create({
            name: 'Steel Rebar (12mm)',
            description: 'Reinforcement for slab',
            unit: 'ton',
            unit_price: 800, // $800 per ton, but here we just mock
            waste_factor_default: 2,
            category_id: slabLeaf._id
        });

        console.log('✅ Catalog successfully seeded!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
};

seedCatalog();
