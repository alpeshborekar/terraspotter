const prisma = require('../config/prisma')

const findByEmail = (email) => {
  return prisma.user.findUnique({ where: { email } })
}

const findById = (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isVerified: true,
      createdAt: true,
    },
  })
}

const createUser = (data) => {
  return prisma.user.create({ data })
}

const updateUser = (id, data) => {
  return prisma.user.update({ where: { id }, data })
}

module.exports = { findByEmail, findById, createUser, updateUser }