import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ReminderSettings {
  user_id: string
  water_reminder_enabled: boolean
  water_reminder_interval_minutes: number
  water_reminder_start_hour: number
  water_reminder_end_hour: number
  meal_reminder_enabled: boolean
  breakfast_time: string | null
  lunch_time: string | null
  snack_time: string | null
  dinner_time: string | null
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    const now = new Date()
    const currentHour = now.getHours()
    const currentMinutes = now.getMinutes()
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinutes.toString().padStart(2, '0')}`
    
    // Busca todas as configurações de lembretes ativas
    const { data: settings, error: settingsError } = await supabase
      .from('reminder_settings')
      .select('*')
    
    if (settingsError) {
      console.error('Erro ao buscar configurações:', settingsError)
      return new Response(
        JSON.stringify({ error: 'Erro ao buscar configurações' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    const pendingReminders: Array<{
      user_id: string
      type: string
      message: string
    }> = []

    for (const setting of settings as ReminderSettings[]) {
      // Verifica lembretes de água
      if (setting.water_reminder_enabled) {
        if (currentHour >= setting.water_reminder_start_hour && 
            currentHour < setting.water_reminder_end_hour) {
          // Verifica se passou o intervalo desde o último lembrete de água
          const { data: lastWaterReminder } = await supabase
            .from('reminder_confirmations')
            .select('confirmed_at')
            .eq('user_id', setting.user_id)
            .eq('reminder_type', 'water')
            .order('confirmed_at', { ascending: false })
            .limit(1)
            .single()

          let shouldSendWater = true
          if (lastWaterReminder) {
            const lastTime = new Date(lastWaterReminder.confirmed_at)
            const diffMinutes = (now.getTime() - lastTime.getTime()) / 1000 / 60
            shouldSendWater = diffMinutes >= setting.water_reminder_interval_minutes
          }

          if (shouldSendWater) {
            pendingReminders.push({
              user_id: setting.user_id,
              type: 'water',
              message: '💧 Hora de beber água! Mantenha-se hidratado.'
            })
          }
        }
      }

      // Verifica lembretes de refeições
      if (setting.meal_reminder_enabled) {
        const mealTimes = [
          { time: setting.breakfast_time, name: 'Café da manhã', emoji: '🌅' },
          { time: setting.lunch_time, name: 'Almoço', emoji: '🍽️' },
          { time: setting.snack_time, name: 'Lanche', emoji: '🍎' },
          { time: setting.dinner_time, name: 'Jantar', emoji: '🌙' }
        ]

        for (const meal of mealTimes) {
          if (meal.time) {
            const [mealHour, mealMinute] = meal.time.split(':').map(Number)
            // Verifica se está dentro de uma janela de 5 minutos do horário da refeição
            const mealDate = new Date()
            mealDate.setHours(mealHour, mealMinute, 0, 0)
            const diffMinutes = Math.abs((now.getTime() - mealDate.getTime()) / 1000 / 60)
            
            if (diffMinutes <= 5) {
              // Verifica se já foi confirmado hoje
              const today = now.toISOString().split('T')[0]
              const { data: confirmed } = await supabase
                .from('reminder_confirmations')
                .select('id')
                .eq('user_id', setting.user_id)
                .eq('reminder_type', meal.name.toLowerCase())
                .gte('confirmed_at', `${today}T00:00:00`)
                .limit(1)
                .single()

              if (!confirmed) {
                pendingReminders.push({
                  user_id: setting.user_id,
                  type: meal.name.toLowerCase(),
                  message: `${meal.emoji} Hora do ${meal.name}! Lembre-se de se alimentar bem.`
                })
              }
            }
          }
        }
      }
    }

    // Salva os lembretes pendentes para serem buscados pelo cliente
    for (const reminder of pendingReminders) {
      await supabase.from('pending_notifications').upsert({
        user_id: reminder.user_id,
        type: reminder.type,
        message: reminder.message,
        created_at: now.toISOString(),
        read: false
      }, {
        onConflict: 'user_id,type'
      })
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        processed: settings?.length || 0,
        reminders_created: pendingReminders.length 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido'
    console.error('Erro no check-reminders:', errorMessage)
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
