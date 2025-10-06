import { PrismaClient } from '@prisma/client' 
import { withAccelerate } from '@prisma/extension-accelerate'

const prisma = new PrismaClient().$extends(withAccelerate())

const CLOTHES_DATA = [
  { 
    title: "Remera básica", 
    description: "Remera de algodón verde oscuro, ideal para uso diario.", 
    imageUrl: "https://acdn-us.mitiendanube.com/stores/001/251/987/products/img_9316-f51d1dd4bd2b2c1f1117363408329219-1024-1024.jpg",
    price: 8500
  },
  { 
    title: "Pantalón de jean", 
    description: "Jeans azules de corte recto, cómodos y versátiles.", 
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOvBtSuQZqOx6VRqHTtiT6H4nltG4TThHHdw&s",
    price: 19500
  },
  { 
    title: "Campera de cuero", 
    description: "Campera negra de cuero sintético, estilo urbano.", 
    imageUrl: "https://acdn-us.mitiendanube.com/stores/591/146/products/campera-cuero-moto-negan-frente-liam-leather-cdcfcdf3f6704e553817277234154959-1024-1024.jpg",
    price: 45900
  },
  { 
    title: "Zapas deportivas", 
    description: "Zapatillas ligeras para entrenamiento o uso casual.", 
    imageUrl: "https://calzalindo.com.ar/3241-large_default/zapatillas-deportivas-topper-wind-v.jpg",
    price: 27900
  },
  { 
    title: "Vestido de verano", 
    description: "Vestido floral fresco, perfecto para días soleados.", 
    imageUrl: "https://m.media-amazon.com/images/I/81URF4BwxTL._AC_UY350_.jpg",
    price: 21400
  },
  { 
    title: "Buzo sin capucha", 
    description: "Buzo de algodón gris sin capucha, abrigado y cómodo.", 
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTxZxnmLq5tVSmGJ860E1rptkrCCOXJ5wX2ZQ&s",
    price: 15900
  },
  { 
    title: "Camisa a cuadros", 
    description: "Camisa de manga larga a cuadros rojos y negros.", 
    imageUrl: "https://i.imgur.com/example-camisa.jpg", 
    price: 17800
  },
  { 
    title: "Buso negro", 
    description: "Buso negro para hombre, ideal para salidas nocturnas.", 
    imageUrl: "https://acdn-us.mitiendanube.com/stores/003/636/320/products/photoroom_20240707_163537-1cbedbcf4ede50d57317502267657017-480-0.jpeg",
    price: 16900
  },
  { 
    title: "Abrigo de lana", 
    description: "Abrigo largo de lana beige para el invierno.", 
    imageUrl: "https://b2c-media.maxmara.com/sys-master/m0/MM/2025/2/6016065106/006/s3details/6016065106006-w-newmang_normal.jpg",
    price: 52900
  },
  { 
    title: "Zapatos", 
    description: "Zapatos clásicos para llevar al trabajo", 
    imageUrl: "https://acdn-us.mitiendanube.com/stores/003/088/606/products/301-c8df95217f5399ca6016836807435997-1024-1024.jpg",
    price: 23900
  }
]

async function main() {
  console.log(`Start seeding products...`)

  console.log(`\nDeleting existing Product records...`)
  const deleteResult = await prisma.product.deleteMany({})

  console.log(`\nStarting Product Seeding...`)
  for (const p of CLOTHES_DATA) {
    const product = await prisma.product.create({
      data: p,
    })
    console.log(`Created product: ${product.title} (ID: ${product.id})`)
  }
  console.log(`Product Seeding finished.`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
