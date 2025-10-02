export type CompazzFunds = {
  "version": "0.1.0",
  "name": "compazz_funds",
  "instructions": [
    {
      "name": "createFund",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "strategy",
          "type": "string"
        },
        {
          "name": "telegramGroupId",
          "type": "string"
        },
        {
          "name": "minContribution",
          "type": "u64"
        },
        {
          "name": "maxMembers",
          "type": "u32"
        },
        {
          "name": "managementFee",
          "type": "u16"
        },
        {
          "name": "performanceFee",
          "type": "u16"
        }
      ]
    },
    {
      "name": "joinFund",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "telegramUserId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTradeProposal",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "action",
          "type": {
            "defined": "TradeAction"
          }
        },
        {
          "name": "amount",
          "type": "string"
        },
        {
          "name": "token",
          "type": "string"
        },
        {
          "name": "reasoning",
          "type": "string"
        },
        {
          "name": "votingDuration",
          "type": "u64"
        }
      ]
    },
    {
      "name": "voteOnProposal",
      "accounts": [
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawFunds",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "fund",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "strategy",
            "type": "string"
          },
          {
            "name": "telegramGroupId",
            "type": "string"
          },
          {
            "name": "minContribution",
            "type": "u64"
          },
          {
            "name": "maxMembers",
            "type": "u32"
          },
          {
            "name": "managementFee",
            "type": "u16"
          },
          {
            "name": "performanceFee",
            "type": "u16"
          },
          {
            "name": "totalDeposits",
            "type": "u64"
          },
          {
            "name": "memberCount",
            "type": "u32"
          },
          {
            "name": "proposalCount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fund",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "contribution",
            "type": "u64"
          },
          {
            "name": "telegramUserId",
            "type": "u64"
          },
          {
            "name": "joinedAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tradeProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fund",
            "type": "publicKey"
          },
          {
            "name": "proposer",
            "type": "publicKey"
          },
          {
            "name": "telegramUserId",
            "type": "u64"
          },
          {
            "name": "proposalId",
            "type": "u64"
          },
          {
            "name": "action",
            "type": {
              "defined": "TradeAction"
            }
          },
          {
            "name": "amount",
            "type": "string"
          },
          {
            "name": "token",
            "type": "string"
          },
          {
            "name": "reasoning",
            "type": "string"
          },
          {
            "name": "votesFor",
            "type": "u32"
          },
          {
            "name": "votesAgainst",
            "type": "u32"
          },
          {
            "name": "totalVotes",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "votingEndsAt",
            "type": "u64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "passed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "publicKey"
          },
          {
            "name": "voter",
            "type": "publicKey"
          },
          {
            "name": "telegramUserId",
            "type": "u64"
          },
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "votedAt",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TradeAction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          },
          {
            "name": "Swap"
          },
          {
            "name": "Hold"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "FundCreated",
      "fields": [
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "name",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "MemberJoined",
      "fields": [
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "TradeProposalCreated",
      "fields": [
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proposer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VoteCast",
      "fields": [
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "vote",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ProposalExecuted",
      "fields": [
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedAccess",
      "msg": "Unauthorized access"
    },
    {
      "code": 6001,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6002,
      "name": "FundInactive",
      "msg": "Fund is inactive"
    },
    {
      "code": 6003,
      "name": "MaxMembersReached",
      "msg": "Maximum members reached"
    },
    {
      "code": 6004,
      "name": "VotingStillActive",
      "msg": "Voting is still active"
    },
    {
      "code": 6005,
      "name": "ProposalNotPassed",
      "msg": "Proposal did not pass"
    },
    {
      "code": 6006,
      "name": "AlreadyVoted",
      "msg": "Already voted on this proposal"
    }
  ]
};

export const IDL: CompazzFunds = {
  "version": "0.1.0",
  "name": "compazz_funds",
  "instructions": [
    {
      "name": "createFund",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "authority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "description",
          "type": "string"
        },
        {
          "name": "strategy",
          "type": "string"
        },
        {
          "name": "telegramGroupId",
          "type": "string"
        },
        {
          "name": "minContribution",
          "type": "u64"
        },
        {
          "name": "maxMembers",
          "type": "u32"
        },
        {
          "name": "managementFee",
          "type": "u16"
        },
        {
          "name": "performanceFee",
          "type": "u16"
        }
      ]
    },
    {
      "name": "joinFund",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "telegramUserId",
          "type": "u64"
        }
      ]
    },
    {
      "name": "createTradeProposal",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "proposer",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "action",
          "type": {
            "defined": "TradeAction"
          }
        },
        {
          "name": "amount",
          "type": "string"
        },
        {
          "name": "token",
          "type": "string"
        },
        {
          "name": "reasoning",
          "type": "string"
        },
        {
          "name": "votingDuration",
          "type": "u64"
        }
      ]
    },
    {
      "name": "voteOnProposal",
      "accounts": [
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "vote",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": false,
          "isSigner": false
        },
        {
          "name": "voter",
          "isMut": true,
          "isSigner": true
        },
        {
          "name": "systemProgram",
          "isMut": false,
          "isSigner": false
        }
      ],
      "args": [
        {
          "name": "vote",
          "type": "bool"
        }
      ]
    },
    {
      "name": "executeProposal",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "proposal",
          "isMut": true,
          "isSigner": false
        }
      ],
      "args": []
    },
    {
      "name": "withdrawFunds",
      "accounts": [
        {
          "name": "fund",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "member",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "fundVault",
          "isMut": true,
          "isSigner": false
        },
        {
          "name": "memberAuthority",
          "isMut": true,
          "isSigner": true
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "fund",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "description",
            "type": "string"
          },
          {
            "name": "strategy",
            "type": "string"
          },
          {
            "name": "telegramGroupId",
            "type": "string"
          },
          {
            "name": "minContribution",
            "type": "u64"
          },
          {
            "name": "maxMembers",
            "type": "u32"
          },
          {
            "name": "managementFee",
            "type": "u16"
          },
          {
            "name": "performanceFee",
            "type": "u16"
          },
          {
            "name": "totalDeposits",
            "type": "u64"
          },
          {
            "name": "memberCount",
            "type": "u32"
          },
          {
            "name": "proposalCount",
            "type": "u64"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "isActive",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "member",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fund",
            "type": "publicKey"
          },
          {
            "name": "authority",
            "type": "publicKey"
          },
          {
            "name": "contribution",
            "type": "u64"
          },
          {
            "name": "telegramUserId",
            "type": "u64"
          },
          {
            "name": "joinedAt",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "tradeProposal",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fund",
            "type": "publicKey"
          },
          {
            "name": "proposer",
            "type": "publicKey"
          },
          {
            "name": "telegramUserId",
            "type": "u64"
          },
          {
            "name": "proposalId",
            "type": "u64"
          },
          {
            "name": "action",
            "type": {
              "defined": "TradeAction"
            }
          },
          {
            "name": "amount",
            "type": "string"
          },
          {
            "name": "token",
            "type": "string"
          },
          {
            "name": "reasoning",
            "type": "string"
          },
          {
            "name": "votesFor",
            "type": "u32"
          },
          {
            "name": "votesAgainst",
            "type": "u32"
          },
          {
            "name": "totalVotes",
            "type": "u32"
          },
          {
            "name": "createdAt",
            "type": "u64"
          },
          {
            "name": "votingEndsAt",
            "type": "u64"
          },
          {
            "name": "executed",
            "type": "bool"
          },
          {
            "name": "passed",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "vote",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proposal",
            "type": "publicKey"
          },
          {
            "name": "voter",
            "type": "publicKey"
          },
          {
            "name": "telegramUserId",
            "type": "u64"
          },
          {
            "name": "vote",
            "type": "bool"
          },
          {
            "name": "votedAt",
            "type": "u64"
          }
        ]
      }
    }
  ],
  "types": [
    {
      "name": "TradeAction",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "Buy"
          },
          {
            "name": "Sell"
          },
          {
            "name": "Swap"
          },
          {
            "name": "Hold"
          }
        ]
      }
    }
  ],
  "events": [
    {
      "name": "FundCreated",
      "fields": [
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "authority",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "name",
          "type": "string",
          "index": false
        }
      ]
    },
    {
      "name": "MemberJoined",
      "fields": [
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "member",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "amount",
          "type": "u64",
          "index": false
        }
      ]
    },
    {
      "name": "TradeProposalCreated",
      "fields": [
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "proposer",
          "type": "publicKey",
          "index": false
        }
      ]
    },
    {
      "name": "VoteCast",
      "fields": [
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "voter",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "vote",
          "type": "bool",
          "index": false
        }
      ]
    },
    {
      "name": "ProposalExecuted",
      "fields": [
        {
          "name": "proposal",
          "type": "publicKey",
          "index": false
        },
        {
          "name": "fund",
          "type": "publicKey",
          "index": false
        }
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "UnauthorizedAccess",
      "msg": "Unauthorized access"
    },
    {
      "code": 6001,
      "name": "InsufficientFunds",
      "msg": "Insufficient funds"
    },
    {
      "code": 6002,
      "name": "FundInactive",
      "msg": "Fund is inactive"
    },
    {
      "code": 6003,
      "name": "MaxMembersReached",
      "msg": "Maximum members reached"
    },
    {
      "code": 6004,
      "name": "VotingStillActive",
      "msg": "Voting is still active"
    },
    {
      "code": 6005,
      "name": "ProposalNotPassed",
      "msg": "Proposal did not pass"
    },
    {
      "code": 6006,
      "name": "AlreadyVoted",
      "msg": "Already voted on this proposal"
    }
  ]
};