interface EmailTemplate {
  subject: string
  template: string
  variables: string[]
}

export const emailTemplates: Record<string, EmailTemplate> = {
  letterScheduled: {
    subject: '信件已成功定时发送',
    template: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>亲爱的 {{username}}：</h2>
        <p>您的信件已成功设置定时发送。</p>
        <p>发送时间：{{scheduledTime}}</p>
        <p>我们会在信件发送时通知您。</p>
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0; color: #666;">信件预览：</p>
          <p style="margin: 10px 0;">{{preview}}</p>
        </div>
        <p>感谢您使用时光信笺！</p>
      </div>
    `,
    variables: ['username', 'scheduledTime', 'preview']
  },
  letterSent: {
    subject: '您的信件已发送',
    template: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>亲爱的 {{username}}：</h2>
        <p>您设定的信件已成功发送。</p>
        <p>现在可以登录查看了！</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{viewUrl}}" style="background: #f5b682; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            查看信件
          </a>
        </div>
        <p>感谢您使用时光信笺！</p>
      </div>
    `,
    variables: ['username', 'viewUrl']
  },
  welcome: {
    subject: '欢迎加入时光信笺',
    template: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>欢迎加入时光信笺，{{username}}！</h2>
        <p>感谢您注册成为我们的用户。</p>
        <p>在这里，您可以：</p>
        <ul>
          <li>写下此刻的心情与感悟</li>
          <li>给未来的自己寄送一封信</li>
          <li>记录生活中的点点滴滴</li>
        </ul>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{loginUrl}}" style="background: #f5b682; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            立即开始
          </a>
        </div>
      </div>
    `,
    variables: ['username', 'loginUrl']
  },
  reminderSoon: {
    subject: '您的信件即将发送',
    template: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>亲爱的 {{username}}：</h2>
        <p>您设定的信件将在 {{remainingTime}} 后发送。</p>
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <p style="margin: 0; color: #666;">信件预览：</p>
          <p style="margin: 10px 0;">{{preview}}</p>
        </div>
        <p>如需修改发送时间，请及时登录调整。</p>
      </div>
    `,
    variables: ['username', 'remainingTime', 'preview']
  },
  monthlyDigest: {
    subject: '您的月度信件回顾',
    template: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>亲爱的 {{username}}：</h2>
        <p>这是您在 {{month}} 的信件统计：</p>
        <div style="margin: 20px 0; padding: 15px; background: #f5f5f5; border-radius: 5px;">
          <p>✉️ 已发送信件：{{sentCount}} 封</p>
          <p>📝 待发送信件：{{scheduledCount}} 封</p>
          <p>📊 字数统计：{{wordCount}} 字</p>
        </div>
        <div style="text-align: center; margin: 30px 0;">
          <a href="{{digestUrl}}" style="background: #f5b682; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px;">
            查看详细统计
          </a>
        </div>
      </div>
    `,
    variables: ['username', 'month', 'sentCount', 'scheduledCount', 'wordCount', 'digestUrl']
  }
}

export function renderEmailTemplate(
  templateName: keyof typeof emailTemplates,
  variables: Record<string, string>
): string {
  const template = emailTemplates[templateName]
  if (!template) {
    throw new Error(`Template ${templateName} not found`)
  }

  let html = template.template
  template.variables.forEach(variable => {
    const value = variables[variable] || ''
    html = html.replace(new RegExp(`{{${variable}}}`, 'g'), value)
  })

  return html
} 