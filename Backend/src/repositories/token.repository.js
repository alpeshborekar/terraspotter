const prisma = require('../config/prisma')

const saveRefreshToken = (userId, hashedToken, expiresAt) => {
  return prisma.refreshToken.create({
    data: { userId, token: hashedToken, expiresAt },
  })
}

const findRefreshToken = (hashedToken) => {
  return prisma.refreshToken.findUnique({ where: { token: hashedToken } })
}

const deleteRefreshToken = (hashedToken) => {
  return prisma.refreshToken.delete({ where: { token: hashedToken } })
}

const deleteAllUserRefreshTokens = (userId) => {
  return prisma.refreshToken.deleteMany({ where: { userId } })
}

const savePasswordResetToken = (userId, hashedToken, expiresAt) => {
  return prisma.passwordResetToken.create({
    data: { userId, token: hashedToken, expiresAt },
  })
}

const findPasswordResetToken = (hashedToken) => {
  return prisma.passwordResetToken.findUnique({ where: { token: hashedToken } })
}

const markPasswordResetTokenUsed = (id) => {
  return prisma.passwordResetToken.update({
    where: { id },
    data: { used: true },
  })
}

module.exports = {
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  savePasswordResetToken,
  findPasswordResetToken,
  markPasswordResetTokenUsed,
}