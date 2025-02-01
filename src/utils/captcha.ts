class Captcha {
  private canvas: HTMLCanvasElement
  private code: string = ''
  
  constructor(width = 120, height = 40) {
    this.canvas = document.createElement('canvas')
    this.canvas.width = width
    this.canvas.height = height
  }

  // 生成随机验证码
  private generateCode(length = 4): string {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
    let code = ''
    for (let i = 0; i < length; i++) {
      code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
  }

  // 绘制验证码
  draw(): { code: string, dataURL: string } {
    const ctx = this.canvas.getContext('2d')!
    const width = this.canvas.width
    const height = this.canvas.height
    
    // 生成新的验证码
    this.code = this.generateCode()

    // 清空画布
    ctx.clearRect(0, 0, width, height)

    // 绘制背景
    ctx.fillStyle = '#f0f2f5'
    ctx.fillRect(0, 0, width, height)

    // 绘制文字
    ctx.font = 'bold 24px Arial'
    ctx.textBaseline = 'middle'
    
    for (let i = 0; i < this.code.length; i++) {
      const x = (width / this.code.length) * i + 15
      const y = height / 2
      const deg = Math.random() * 30 * Math.PI / 180
      
      ctx.translate(x, y)
      ctx.rotate(deg)
      
      ctx.fillStyle = `rgb(${Math.random() * 100}, ${Math.random() * 100}, ${Math.random() * 100})`
      ctx.fillText(this.code[i], 0, 0)
      
      ctx.rotate(-deg)
      ctx.translate(-x, -y)
    }

    // 绘制干扰线
    for (let i = 0; i < 4; i++) {
      ctx.strokeStyle = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`
      ctx.beginPath()
      ctx.moveTo(Math.random() * width, Math.random() * height)
      ctx.lineTo(Math.random() * width, Math.random() * height)
      ctx.stroke()
    }

    // 绘制干扰点
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgb(${Math.random() * 200}, ${Math.random() * 200}, ${Math.random() * 200})`
      ctx.beginPath()
      ctx.arc(Math.random() * width, Math.random() * height, 1, 0, 2 * Math.PI)
      ctx.fill()
    }

    return {
      code: this.code,
      dataURL: this.canvas.toDataURL('image/png')
    }
  }
}

export default Captcha 