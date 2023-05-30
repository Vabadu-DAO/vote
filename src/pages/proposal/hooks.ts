import { useMutation } from "@tanstack/react-query";
import { useProposalAddress, useProposalStatus } from "hooks";
import _ from "lodash";
import { Logger } from "utils";
import { useEnpointsStore } from "./store";
import {
  filterTxByTimestamp,
  getClientV2,
  getClientV4,
  getTransactions,
} from "ton-vote-contracts-sdk";
import { Endpoints, ProposalResults } from "types";
import { lib } from "lib/lib";
import { Transaction } from "ton-core";
import { useProposalPageTranslations } from "i18n/hooks/useProposalPageTranslations";
import {  errorToast, usePromiseToast } from "toasts";
import { mock } from "mock/mock";
import { useProposalQuery } from "query/getters";

const handleNulls = (result?: ProposalResults) => {
  const getValue = (value: any) => {
    if (_.isNull(value) || _.isNaN(value)) return 0;
    if (_.isString(value)) return Number(value);
    return value;
  };

  if (!result) return;
  _.forEach(result, (value, key) => {
    result[key] = getValue(value);
  });

  return result;
};

export const useVerifyProposalResults = () => {
  const proposalAddress = useProposalAddress();
  const { data } = useProposalPageQuery(false);
  const { setEndpoints, endpoints } = useEnpointsStore();
  const translations = useProposalPageTranslations();


  const promiseToast = usePromiseToast();

  return useMutation(
    async (customEndpoints: Endpoints) => {
     
      setEndpoints(customEndpoints);
      const promiseFn = async () => {
        const clientV2 = await getClientV2(
          endpoints?.clientV2Endpoint,
          endpoints?.apiKey
        );
        const clientV4 = await getClientV4(endpoints?.clientV4Endpoint);

        let transactions: Transaction[] = [];

        const result = await getTransactions(clientV2, proposalAddress);

        transactions = filterTxByTimestamp(result.allTxns, data?.maxLt || "");

        const contractState = await lib.getProposalFromContract(
          clientV2,
          clientV4,
          proposalAddress,
          data?.metadata,
          transactions
        );
        const currentResults = handleNulls(data?.proposalResult);
        const compareToResults = handleNulls(contractState?.proposalResult);

        Logger({
          currentResults,
          compareToResults,
        });

        const isEqual = _.isEqual(currentResults, compareToResults);

        if (!isEqual) {
          throw new Error("Not equal");
        }
        return isEqual;
      };

      const promise = promiseFn();

      promiseToast({
        promise,
        success: translations.resultsVerified,
        loading: translations.verifyingResults,
        error: translations.failedToVerifyResults,
      });

      if (_.isEmpty(data?.proposalResult)) {
        return true;
      }
      return promise;
    },
    {
      onError: (error: Error) => errorToast(error.message),
    }
  );
};

export const useProposalPageStatus = () => {
  const { data } = useProposalPageQuery();
  const proposalAddress = useProposalAddress();
  return useProposalStatus(proposalAddress, data?.metadata);
};


export const useProposalPageQuery = (isCustomEndpoint: boolean = false) => {
  const address = useProposalAddress();
  return useProposalQuery(address, {
    refetchInterval: 30_000,
    isCustomEndpoint,
    validateServerMaxLt: true,
    ignoreMaxLt: isCustomEndpoint,
  });
};
