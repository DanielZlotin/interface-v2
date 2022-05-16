import React, { useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Box, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { useWalletModalToggle } from 'state/application/hooks';
import {
  isTransactionRecent,
  useAllTransactions,
} from 'state/transactions/hooks';
import { TransactionDetails } from 'state/transactions/reducer';
import { shortenAddress, addMaticToMetamask, isSupportedNetwork } from 'utils';
import useENSName from 'hooks/useENSName';
import { WalletModal } from 'components';
import { useActiveWeb3React } from 'hooks';
import QuickIcon from 'assets/images/quickIcon.svg';
import QuickLogo from 'assets/images/quickLogo.png';
import { ReactComponent as ThreeDotIcon } from 'assets/images/ThreeDot.svg';
import { ReactComponent as LightIcon } from 'assets/images/LightIcon.svg';
import WalletIcon from 'assets/images/WalletIcon.png';
import 'components/styles/Header.scss';

const newTransactionsFirst = (a: TransactionDetails, b: TransactionDetails) => {
  return b.addedTime - a.addedTime;
};

const Header: React.FC = () => {
  const { pathname } = useLocation();
  const { account } = useActiveWeb3React();
  const { ethereum } = window as any;
  const { ENSName } = useENSName(account ?? undefined);
  const [openDetailMenu, setOpenDetailMenu] = useState(false);
  const theme = useTheme();
  const allTransactions = useAllTransactions();
  const sortedRecentTransactions = useMemo(() => {
    const txs = Object.values(allTransactions);
    return txs.filter(isTransactionRecent).sort(newTransactionsFirst);
  }, [allTransactions]);

  const pending = sortedRecentTransactions
    .filter((tx: any) => !tx.receipt)
    .map((tx: any) => tx.hash);
  const confirmed = sortedRecentTransactions
    .filter((tx: any) => tx.receipt)
    .map((tx: any) => tx.hash);
  const tabletWindowSize = useMediaQuery(theme.breakpoints.down('sm'));
  const mobileWindowSize = useMediaQuery(theme.breakpoints.down('xs'));
  const toggleWalletModal = useWalletModalToggle();
  const menuItems = [
    {
      link: '/swap',
      text: 'Swap',
      id: 'swap-page-link',
    },
    {
      link: '/pools',
      text: 'Pool',
      id: 'pools-page-link',
    },
    {
      link: '/farm',
      text: 'Farm',
      id: 'farm-page-link',
    },
    {
      link: '/dragons',
      text: 'Dragon’s Lair',
      id: 'dragons-page-link',
    },
    {
      link: '/convert',
      text: 'Convert',
      id: 'convert-quick',
    },
    {
      link: '/analytics',
      text: 'Analytics',
      id: 'analytics-page-link',
    },
  ];

  const outLinks: any[] = [
    // {
    //   link: '/',
    //   text: 'Governance',
    // },
    // {
    //   link: '/',
    //   text: 'Docs',
    // },
    // {
    //   link: '/',
    //   text: 'For Developers',
    // },
    // {
    //   link: '/',
    //   text: 'Help & Tutorials',
    // },
    // {
    //   link: '/',
    //   text: 'Knowledge Base',
    // },
    // {
    //   link: '/',
    //   text: 'News',
    // },
  ];

  return (
    <Box className='header'>
      <WalletModal
        ENSName={ENSName ?? undefined}
        pendingTransactions={pending}
        confirmedTransactions={confirmed}
      />
      <Link to='/'>
        <img
          src={mobileWindowSize ? QuickIcon : QuickLogo}
          alt='QuickLogo'
          height={60}
        />
      </Link>
      {!tabletWindowSize && (
        <Box className='mainMenu'>
          {menuItems.map((val, index) => (
            <Link
              to={val.link}
              key={index}
              id={val.id}
              className={
                pathname.indexOf(val.link) > -1 ? 'active' : 'menuItem'
              }
            >
              <Typography variant='body2'>{val.text}</Typography>
            </Link>
          ))}
          {/* <Box display='flex' className='menuItem'>
            <ThreeDotIcon />
            <Box
              position='absolute'
              top={32}
              left={0}
              width={209}
              paddingTop={10}
            >
              <Box className='subMenu'>
                {outLinks.map((item, ind) => (
                  <a href={item.link} key={ind}>
                    <Typography variant='body2'>{item.text}</Typography>
                  </a>
                ))}
              </Box>
            </Box>
          </Box> */}
        </Box>
      )}
      {tabletWindowSize && (
        <Box className='mobileMenuContainer'>
          <Box className='mobileMenu'>
            {menuItems.slice(0, 4).map((val, index) => (
              <Link
                to={val.link}
                key={index}
                className={
                  pathname.indexOf(val.link) > -1 ? 'active' : 'menuItem'
                }
              >
                <Typography variant='body2'>{val.text}</Typography>
              </Link>
            ))}
            <Box display='flex' className='menuItem'>
              <ThreeDotIcon
                onClick={() => setOpenDetailMenu(!openDetailMenu)}
              />
              {openDetailMenu && (
                <Box
                  position='absolute'
                  bottom={72}
                  right={12}
                  width={209}
                  bgcolor={theme.palette.secondary.dark}
                  borderRadius={20}
                  py={1}
                  border={`1px solid ${theme.palette.divider}`}
                >
                  <Box className='subMenu'>
                    {menuItems.slice(4, menuItems.length).map((val, index) => (
                      <Link
                        to={val.link}
                        key={index}
                        className='menuItem'
                        onClick={() => setOpenDetailMenu(false)}
                      >
                        <Typography variant='body2'>{val.text}</Typography>
                      </Link>
                    ))}
                    {outLinks.map((item, ind) => (
                      <a
                        href={item.link}
                        key={ind}
                        onClick={() => setOpenDetailMenu(false)}
                      >
                        <Typography variant='body2'>{item.text}</Typography>
                      </a>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
      <Box>
        <Box
          width={36}
          height={36}
          display='flex'
          alignItems='center'
          justifyContent='center'
          marginRight={1}
        >
          <LightIcon />
        </Box>
        {account && (!ethereum || isSupportedNetwork(ethereum)) ? (
          <Box
            id='web3-status-connected'
            className='accountDetails'
            onClick={toggleWalletModal}
          >
            <Typography>{shortenAddress(account)}</Typography>
            <img src={WalletIcon} alt='Wallet' />
          </Box>
        ) : (
          <Box
            className={`connectButton ${
              ethereum && !isSupportedNetwork(ethereum) ? 'danger' : 'primary'
            }`}
            onClick={() => {
              if (!ethereum || isSupportedNetwork(ethereum)) {
                toggleWalletModal();
              }
            }}
          >
            {ethereum && !isSupportedNetwork(ethereum)
              ? 'Wrong Network'
              : 'Connect Wallet'}
            {ethereum && !isSupportedNetwork(ethereum) && (
              <Box
                position='absolute'
                top={36}
                width={272}
                right={0}
                paddingTop='18px'
              >
                <Box className='wrongNetworkContent'>
                  <Typography variant='body2'>
                    Please switch your wallet to Polygon Network.
                  </Typography>
                  <Box onClick={addMaticToMetamask}>Switch to Polygon</Box>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Header;
