function shortenAddress(address) {
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
}

export default shortenAddress;
