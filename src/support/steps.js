const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const Sequelize = require('sequelize');
const secretsClient = require('serverless-secrets/client');
const secretsPromise = secretsClient.load();
let sequelize;

class NoMoreDataError extends Error {
  constructor() {
    super();
    this.name = 'NoMoreDataError';
  }
}

exports.rewriteActivatedAccountWebhookEvents = async event => {
  let offset = event.offset || 0;
  let limit = event.limit || 25;

  await secretsPromise;
  const databaseAddress = `mysql://${process.env.DALA_STORAGE_USERNAME}:${process.env.DALA_STORAGE_PASSWORD}@${process.env.DALA_STORAGE_CLUSTER}:${
    process.env.DALA_STORAGE_PORT
  }/mifostenant-default`;
  if (!sequelize) {
    sequelize = new Sequelize(databaseAddress, {
      operatorsAliases: false
    });
  }
  let query = `select mc.id as clientId, mc.office_id as officeId, msa.id as resourceId, msa.id as savingsId, msa.activatedon_date from m_savings_account msa \
            join m_client mc on msa.client_id = mc.id \
            where msa.status_enum = 300 \
            order by clientId desc
            limit ${offset}, ${limit}`;
  let queryResults = await sequelize.query(query);
  let results = queryResults[0];
  if (!results.length) throw new NoMoreDataError();
  let batchPutResult = await documentClient
    .batchWrite({
      RequestItems: {
        FineractWebhookEvents: results.map(createPutRequests)
      }
    })
    .promise();
  console.log(batchPutResult);
  if (batchPutResult.UnprocessedItems && batchPutResult.UnprocessedItems.PutRequest && batchPutResult.UnprocessedItems.PutRequest.length) {
    //some items didn't process - rather process the whole batch again
    return { offset, limit };
  }
  offset += results.length;
  await sequelize.close();
  return { offset, limit };
};

function createPutRequests(item) {
  console.log('item', item);
  return {
    PutRequest: {
      Item: {
        entityId: `${item.clientId}`,
        timestamp: new Date(item.activatedon_date).toISOString(),
        payload: {
          action: 'ACTIVATE',
          entity: 'SAVINGSACCOUNT',
          body: {
            clientId: item.clientId,
            officeId: item.officeId,
            resourceId: item.resourceId,
            savingsId: item.savingsId
          }
        }
      }
    }
  };
}
