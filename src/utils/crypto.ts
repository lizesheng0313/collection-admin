import md5 from 'crypto-js/md5';

/**
 * MD5加密函数
 * @param str 需要加密的字符串
 * @returns 加密后的字符串
 */
export const md5Encrypt = (str: string): string => {
  return md5(str).toString();
}; 