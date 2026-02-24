import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Detect if using placeholder values from .env.local.example
const isPlaceholder =
    supabaseUrl.includes('YOUR_PROJECT_ID') ||
    supabaseAnonKey.includes('your_supabase_anon_key_here');

let _supabase: SupabaseClient | null = null;

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
    get(_target, prop) {
        if (!_supabase && supabaseUrl && supabaseAnonKey && !isPlaceholder) {
            _supabase = createClient(supabaseUrl, supabaseAnonKey);
        }
        if (!_supabase) {
            // During build/SSR or when using placeholders, return a robust no-op proxy that supports chaining
            if (prop === 'isPlaceholder') return true;

            const createChainer = (errorResponse: { data: any; error: any }) => {
                const chainer: any = () => chainer;
                // Add common result properties
                chainer.data = errorResponse.data;
                chainer.error = errorResponse.error;
                // Make it thenable for async/await
                chainer.then = (resolve: (val: any) => void) => resolve(errorResponse);
                // Support common methods by returning the same chainer
                const methods = ['from', 'select', 'order', 'eq', 'single', 'update', 'upsert', 'insert', 'delete', 'match', 'range', 'limit', 'maybeSingle', 'rpc'];
                methods.forEach(m => { chainer[m] = () => chainer; });
                return chainer;
            };

            const unconfiguredError = {
                data: null,
                error: { message: 'Supabase is not configured. Please check your .env.local file.', code: 'UNCONFIGURED' }
            };

            if (prop === 'from' || prop === 'rpc') return () => createChainer(unconfiguredError);

            if (prop === 'auth') return {
                getSession: () => Promise.resolve({ data: { session: null }, error: null }),
                onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => { } } } }),
                signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
                signUp: () => Promise.resolve({ data: { user: null, session: null }, error: { message: 'Supabase not configured' } }),
                signOut: () => Promise.resolve({ error: null })
            };
            return () => { };
        }
        return (_supabase as unknown as Record<string, unknown>)[prop as string];
    },
});

/** Create a service-role client for admin operations */
export function createServiceClient() {
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY not set');
    return createClient(supabaseUrl, serviceKey);
}

