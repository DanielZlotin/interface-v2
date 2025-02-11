import React, { useCallback, useMemo, useState } from 'react';
import { Box, useMediaQuery, useTheme } from '@material-ui/core';
import CustomSelector from 'components/v3/CustomSelector';
import CustomTabSwitch from 'components/v3/CustomTabSwitch';
import useParsedQueryString from 'hooks/useParsedQueryString';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import EternalFarmsPage from 'pages/EternalFarmsPage';
import GammaFarmsPage from 'pages/GammaFarmsPage';
import { FarmingMyFarms } from 'components/StakerMyStakes';
import { useActiveWeb3React } from 'hooks';
import { ChainId } from '@uniswap/sdk';
import { SelectorItem } from 'components/v3/CustomSelector/CustomSelector';
import { SearchInput, SortColumns, CustomSwitch } from 'components';
import { GlobalConst } from 'constants/index';
import { useUnipilotFarms } from 'hooks/v3/useUnipilotFarms';
import UnipilotFarmsPage from 'pages/UnipilotFarmsPage';
import { getAllGammaPairs } from 'utils';

interface FarmCategory {
  id: number;
  text: string;
  link: string;
  hasSeparator?: boolean;
}

export default function Farms() {
  const { t } = useTranslation();
  const { chainId } = useActiveWeb3React();
  const chainIdToUse = chainId ?? ChainId.MATIC;

  const parsedQuery = useParsedQueryString();
  const farmStatus =
    parsedQuery && parsedQuery.farmStatus
      ? (parsedQuery.farmStatus as string)
      : 'active';
  const { breakpoints } = useTheme();
  const isMobile = useMediaQuery(breakpoints.down('xs'));

  const history = useHistory();

  const allGammaFarms = getAllGammaPairs(chainId).filter(
    (item) => item.ableToFarm,
  );

  const { data: unipilotFarmsArray } = useUnipilotFarms(chainId);
  const unipilotFarms = useMemo(() => {
    if (!unipilotFarmsArray) return [];
    return unipilotFarmsArray;
  }, [unipilotFarmsArray]);

  const redirectWithFarmStatus = (status: string) => {
    const currentPath = history.location.pathname + history.location.search;
    let redirectPath;
    if (parsedQuery && parsedQuery.farmStatus) {
      redirectPath = currentPath.replace(
        `farmStatus=${parsedQuery.farmStatus}`,
        `farmStatus=${status}`,
      );
    } else {
      redirectPath = `${currentPath}${
        history.location.search === '' ? '?' : '&'
      }farmStatus=${status}`;
    }
    history.push(redirectPath);
  };

  const currentTabQueried =
    parsedQuery && parsedQuery.tab
      ? (parsedQuery.tab as string)
      : allGammaFarms.length > 0
      ? 'gamma-farms'
      : unipilotFarms.length > 0
      ? 'unipilot-farms'
      : 'eternal-farms';

  const v3FarmCategories = useMemo(() => {
    const farmCategories: FarmCategory[] = [
      {
        text: t('myFarms'),
        id: 0,
        link: 'my-farms',
      },
      {
        text: t('quickswapFarms'),
        id: 1,
        link: 'eternal-farms',
      },
    ];
    if (allGammaFarms.length > 0) {
      farmCategories.push({
        text: t('gammaFarms'),
        id: 2,
        link: 'gamma-farms',
        hasSeparator: true,
      });
    }
    if (unipilotFarms.length > 0) {
      farmCategories.push({
        text: t('unipilotFarms'),
        id: 3,
        link: 'unipilot-farms',
        hasSeparator: true,
      });
    }
    return farmCategories;
  }, [t, allGammaFarms, unipilotFarms]);
  const onChangeFarmCategory = useCallback(
    (selected: SelectorItem) => {
      history.push(`?tab=${selected?.link}`);
    },
    [history],
  );

  const selectedFarmCategory = useMemo(() => {
    const tab = v3FarmCategories.find(
      (item) => item?.link === currentTabQueried,
    );
    if (!tab) {
      return v3FarmCategories[0];
    } else {
      return tab;
    }
  }, [currentTabQueried, v3FarmCategories]);

  const farmFilters = useMemo(
    () => [
      {
        text: t('allFarms'),
        id: GlobalConst.utils.v3FarmFilter.allFarms,
      },
      {
        text: t('stablecoins'),
        id: GlobalConst.utils.v3FarmFilter.stableCoin,
      },
      {
        text: t('blueChips'),
        id: GlobalConst.utils.v3FarmFilter.blueChip,
      },
      {
        text: t('stableLPs'),
        id: GlobalConst.utils.v3FarmFilter.stableLP,
      },
      {
        text: t('otherLPs'),
        id: GlobalConst.utils.v3FarmFilter.otherLP,
      },
    ],
    [t],
  );
  const [farmFilter, setFarmFilter] = useState(farmFilters[0].id);

  const [searchValue, setSearchValue] = useState('');

  const [sortBy, setSortBy] = useState(GlobalConst.utils.v3FarmSortBy.pool);
  const [sortDesc, setSortDesc] = useState(false);

  const farmStatusItems = [
    {
      text: t('active'),
      onClick: () => {
        redirectWithFarmStatus('active');
      },
      condition: farmStatus === 'active',
    },
    {
      text: t('ended'),
      onClick: () => {
        redirectWithFarmStatus('ended');
      },
      condition: farmStatus === 'ended',
    },
  ];

  const sortColumns = [
    {
      text: t('pool'),
      index: GlobalConst.utils.v3FarmSortBy.pool,
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('tvl'),
      index: GlobalConst.utils.v3FarmSortBy.tvl,
      width: 0.2,
      justify: 'flex-start',
    },
    {
      text: t('rewards'),
      index: GlobalConst.utils.v3FarmSortBy.rewards,
      width: 0.3,
      justify: 'flex-start',
    },
    {
      text: t('apr'),
      index: GlobalConst.utils.v3FarmSortBy.apr,
      width: 0.2,
      justify: 'flex-start',
    },
  ];

  const sortByDesktopItems = sortColumns.map((item) => {
    return {
      ...item,
      onClick: () => {
        if (sortBy === item.index) {
          setSortDesc(!sortDesc);
        } else {
          setSortBy(item.index);
          setSortDesc(false);
        }
      },
    };
  });

  return (
    <Box className='bg-palette' borderRadius={10}>
      <Box pt={2} px={2} className='flex flex-wrap justify-between'>
        <CustomSelector
          height={36}
          items={v3FarmCategories}
          selectedItem={selectedFarmCategory}
          handleChange={onChangeFarmCategory}
        />
        <Box
          className='flex items-center flex-wrap'
          width={isMobile ? '100%' : 'auto'}
        >
          {selectedFarmCategory.id !== 0 && (
            <Box mt={isMobile ? 2 : 0} width={isMobile ? '100%' : 160}>
              <CustomSwitch width='100%' height={40} items={farmStatusItems} />
            </Box>
          )}
          <Box
            mt={isMobile ? 2 : 0}
            ml={isMobile ? 0 : 2}
            width={isMobile ? '100%' : 200}
          >
            <SearchInput
              placeholder='Search'
              value={searchValue}
              setValue={setSearchValue}
              isIconAfter
            />
          </Box>
        </Box>
      </Box>

      {selectedFarmCategory.id !== 0 && (
        <>
          <Box mt={2} pl='12px' className='bg-secondary1'>
            <CustomTabSwitch
              items={farmFilters}
              value={farmFilter}
              handleTabChange={setFarmFilter}
              height={50}
            />
          </Box>
          {!isMobile && (
            <Box mt={2} px={3.5}>
              <Box width='90%'>
                <SortColumns
                  sortColumns={sortByDesktopItems}
                  selectedSort={sortBy}
                  sortDesc={sortDesc}
                />
              </Box>
            </Box>
          )}
        </>
      )}

      {selectedFarmCategory?.id === 0 && (
        <FarmingMyFarms search={searchValue} chainId={chainIdToUse} />
      )}
      {selectedFarmCategory?.id === 1 && (
        <EternalFarmsPage
          farmFilter={farmFilter}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
          chainId={chainIdToUse}
        />
      )}
      {selectedFarmCategory?.id === 2 && (
        <GammaFarmsPage
          farmFilter={farmFilter}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
        />
      )}
      {selectedFarmCategory?.id === 3 && (
        <UnipilotFarmsPage
          farmFilter={farmFilter}
          search={searchValue}
          sortBy={sortBy}
          sortDesc={sortDesc}
        />
      )}
    </Box>
  );
}
