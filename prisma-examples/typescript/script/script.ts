import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// A `main` function so that we can use async/await
async function main() {
  const user1Email = `alice${Date.now()}@prisma.io`
  const user2Email = `bob${Date.now()}@prisma.io`

  // Seed the database with users and posts
  const user1 = await prisma.user.create({
    data: {
      email: user1Email,
      name: 'Alice',
      posts: {
        create: {
          title: 'Watch the talks from Prisma Day 2019',
          content: 'https://www.prisma.io/blog/z11sg6ipb3i1/',
          published: true,
        },
      },
    },
    include: {
      posts: true,
    },
  })
  const user2 = await prisma.user.create({
    data: {
      email: user2Email,
      name: 'Bob',
      posts: {
        create: [
          {
            title: 'Subscribe to GraphQL Weekly for community news',
            content: 'https://graphqlweekly.com/',
            published: true,
          },
          {
            title: 'Follow Prisma on Twitter',
            content: 'https://twitter.com/prisma/',
            published: false,
          },
        ],
      },
    },
    include: {
      posts: true,
    },
  })
  console.log(
    `Created users: ${user1.name} (${user1.posts.length} post) and ${user2.name} (${user2.posts.length} posts) `,
  )

  // Retrieve all published posts
  const allPosts = await prisma.post.findMany({
    where: { published: true },
  })
  console.log(`Retrieved all published posts: ${JSON.stringify(allPosts)}`)

  // Create a new post (written by an already existing user with email alice@prisma.io)
  const newPost = await prisma.post.create({
    data: {
      title: 'Join the Prisma Slack community',
      content: 'http://slack.prisma.io',
      published: false,
      author: {
        connect: {
          email: user1Email,
        },
      },
    },
  })
  console.log(`Created a new post: ${JSON.stringify(newPost)}`)

  // Publish the new post
  const updatedPost = await prisma.post.update({
    where: {
      id: newPost.id,
    },
    data: {
      published: true,
    },
  })
  console.log(`Published the newly created post: ${JSON.stringify(updatedPost)}`)

  // Retrieve all posts by user with email alice@prisma.io
  const postsByUser = await prisma.user
    .findUnique({
      where: {
        email: user1Email,
      },
    })
    .posts()
  console.log(`Retrieved all posts from a specific user: ${JSON.stringify(postsByUser)}`)
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
