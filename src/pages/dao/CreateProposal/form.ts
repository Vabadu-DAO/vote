import { PROPOSAL_ABOUT_CHARS_LIMIT, PROPOSAL_TITLE_LIMIT } from "consts";
import { FormikProps } from "formik";
import _ from "lodash";
import moment from "moment";
import { VotingPowerStrategy } from "ton-vote-sdk";
import { InputInterface } from "types";
import { validateAddress } from "utils";
import * as Yup from "yup";


export interface FormData {
  proposalStartTime?: number;
  proposalEndTime?: number;
  proposalSnapshotTime?: number;
  description: string;
  title: string;
  jetton: string;
  nft: string;
  votingPowerStrategy: number;
}

export const FormSchema = Yup.object().shape({
  description: Yup.string().test(
    "test",
    `About must be less than or equal to ${PROPOSAL_ABOUT_CHARS_LIMIT} characters`,
    (value, context) => {
      return _.size(value) <= PROPOSAL_ABOUT_CHARS_LIMIT;
    }
  ),
  title: Yup.string()
    .required("Title is Required")
    .test(
      "test",
      `Title must be less than or equal to ${PROPOSAL_TITLE_LIMIT} characters`,
      (value, context) => {
        return _.size(value) <= PROPOSAL_TITLE_LIMIT;
      }
    ),
  jetton: Yup.string()
    .test("test", "Invalid jetton address", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.JettonBalance
        ? validateAddress(value)
        : true;
    })
    .test("test", "Jetton address requird", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.JettonBalance
        ? !!value
        : true;
    }),
  nft: Yup.string()
    .test("test", "Invalid NFT address", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.NftCcollection
        ? validateAddress(value)
        : true;
    })
    .test("test", "NFT requird", (value, context) => {
      return context.parent.votingPowerStrategy ===
        VotingPowerStrategy.NftCcollection
        ? !!value
        : true;
    }),
  proposalStartTime: Yup.number()
    .required("Proposal start time is required")
    .test(
      "error",
      "Proposal start time must be greater than current time",
      (value = 0) => {
        return value > moment().valueOf();
      }
    ),
  proposalEndTime: Yup.number()
    .required("Proposal end time is required")
    .test(
      "error",
      "Proposal end time must be greater than proposal start time",
      (value = 0, context) => {
        return value > context.parent.proposalStartTime;
      }
    )
    .test(
      "error2",
      "Proposal end time must be greater than proposal start time",
      (value = 0, context) => {
        return value > context.parent.proposalStartTime;
      }
    ),
  proposalSnapshotTime: Yup.number()
    .test(
      "error",
      "Proposal snapshot time must be smaller than proposal start time",
      (value = 0, context) => {
        return value < context.parent.proposalStartTime!;
      }
    )
    .test(
      "error2",
      "Snapshot time can be up to 14 days before specified start time",
      (value = 0) => {
        return value >= moment().subtract("14", "days").valueOf();
      }
    )
    .test(
      "error3",
      "Snaphot time must be smaller than current time",
      (value = 0) => {
        return value <= moment().valueOf();
      }
    )
    .required("Proposal snapshot time is required"),
});

export const useInputs = (formik: FormikProps<FormData>): InputInterface[] => {

  return [
    {
      label: "Title",
      type: "text",
      name: "title",
      required: true,
      limit: PROPOSAL_TITLE_LIMIT,
    },
    {
      label: "Description",
      type: "textarea",
      name: "description",
      rows: 9,
      tooltip:
        "Supports Markdown for editing, adding images, etc. [Read more](https://www.markdownguide.org/basic-syntax/)",
      limit: PROPOSAL_ABOUT_CHARS_LIMIT,
    },
    {
      label: "Select Voting Strategy",
      type: "select",
      name: "votingPowerStrategy",
      options: [
        {
          label: "Ton Balance",
          value: 0,
        },
        {
          label: "Jetton Balance",
          value: 1,
          input: {
            label: "Jetton Address",
            type: "address",
            name: "jetton",
            required:
              formik.values.votingPowerStrategy ===
              VotingPowerStrategy.JettonBalance,
          },
        },
        {
          label: "NFT Collection",
          value: 2,
          input: {
            label: "NFT Address",
            type: "address",
            name: "nft",
            required:
              formik.values.votingPowerStrategy ===
              VotingPowerStrategy.NftCcollection,
          },
        },
      ],
    },
    {
      label: "Snapshot time",
      type: "date",
      name: "proposalSnapshotTime",
      required: true,
      tooltip: "Snapshot time can be up to 14 days before specified start time",
    },
    {
      label: "Start time",
      type: "date",
      name: "proposalStartTime",
      required: true,
    },
    {
      label: "End time",
      type: "date",
      name: "proposalEndTime",
      required: true,
    },
  ];
};
