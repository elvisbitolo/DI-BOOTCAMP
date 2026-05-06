import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elvisbitolo.supabase.co'
const supabaseAnonKey = 'sb_publishable_rb6udSFZ2TGRLH1U0ZuoDg_UBuVro1g'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Real-time subscriptions
export const subscribeToOrders = (callback) => {
  return supabase
    .channel('orders')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'orders' },
      callback
    )
    .subscribe()
}

export const subscribeToUsers = (callback) => {
  return supabase
    .channel('users')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'users' },
      callback
    )
    .subscribe()
}

export const subscribeToMessages = (callback) => {
  return supabase
    .channel('messages')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'messages' },
      callback
    )
    .subscribe()
}
