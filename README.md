# treasury

[Overview and UI Demo (VIDEO)](https://youtu.be/RsVJvRUNgrw)

```
// ---------------------------------------------------------------------------
// Treasury smart contract. Owner (the Treasurer) does not have the ability to
// spend.
//
// Instead, the Treasurer appoints Trustees who approve spending proposals.
// Funds are sent automatically once a proposal is approved by a simple
// majority of trustees.
//
// Trustees can be flagged as inactive by the Treasurer. An inactive Trustee
// cannot vote. The Treasurer may set/reset flags. The Treasurer can replace
// any Trustee, though any approvals already made will count.
// ---------------------------------------------------------------------------
```
