import type { NextPage } from 'next'
import fs from 'fs'
import path from 'path'

const Home: NextPage = () => {
  const htmlFilePath = path.join(process.cwd(), 'public', 'page.html')
  const htmlContent = fs.readFileSync(htmlFilePath, 'utf8')
  
  return <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
}

export default Home